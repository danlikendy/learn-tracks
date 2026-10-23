#!/usr/bin/env python3
"""Download the Nareshka corpus available to the MCP token.

The search tools ignore page numbers after the first page, so this script
walks numbered ids (hub:nrsk-q-go-00001 and the same pattern for other
subjects) and, where ids are random, splits the search by query text until
each piece fits in one page.

Reads the bearer token from ~/.cursor/mcp.json. Writes JSONL outside the repo.
Stop with Ctrl-C and run the same command again: finished ids are skipped.

    python3 scripts/export_nareshka.py
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

MCP_CONFIG = Path.home() / ".cursor" / "mcp.json"
DEFAULT_OUT = Path.home() / "Downloads" / "nareshka-export"
PACE_SECONDS = 1.1

LETTERS = list("абвгдеёжзийклмнопрстуфхцчшщъыьэюя") + list(
    "abcdefghijklmnopqrstuvwxyz0123456789"
)
SAMPLE_LETTERS = ["е", "щ", "ы", "ф", "z", "7"]
WORDS = [
    "как",
    "что",
    "чем",
    "почему",
    "регрес",
    "классиф",
    "кластер",
    "градиент",
    "дерево",
    "бустинг",
    "метрик",
    "вероят",
    "байес",
    "гипотез",
    "выборк",
    "признак",
    "валидац",
    "нейрон",
    "свёрт",
    "сверт",
    "эмбед",
    "токен",
    "текст",
    "стационар",
    "изображ",
    "функц",
    "класс",
    "памят",
    "поток",
    "канал",
    "горутин",
    "интерфейс",
    "массив",
    "хеш",
    "индекс",
    "транзак",
    "sql",
    "docker",
    "linux",
    "git",
    "http",
    "css",
    "html",
    "react",
    "python",
    "java",
    "async",
    "алгоритм",
    "сортир",
    "mutex",
    "deadlock",
    "pytest",
    "sklearn",
    "pandas",
    "bert",
    "регуляр",
    "сигмоид",
    "кросс",
    "дисперс",
    "kubernetes",
    "горутин",
    "flex",
    "grid",
    "promise",
    "замыкан",
]

# Numbered theory ids seen in the first export, plus likely neighbours.
# Width is the zero-padding. known is the deck size when we already have it.
THEORY_SCANS = [
    ("hub:nrsk-q-go-", 5, 2505),
    ("hub:nrsk-q-csharp-", 5, 2350),
    ("hub:nrsk-q-devops-", 5, 2124),
    ("hub:nrsk-q-python-", 5, None),
    ("hub:nrsk-q-java-", 5, None),
    ("hub:nrsk-q-javascript-", 5, None),
    ("hub:nrsk-q-kotlin-", 5, None),
    ("hub:nrsk-q-rust-", 5, None),
    ("hub:nrsk-q-cpp-", 5, None),
    ("hub:nrsk-q-php-", 5, None),
    ("hub:nrsk-q-sql-", 5, None),
    ("hub:nrsk-q-ml-", 5, None),
    ("hub:nrsk-q-ds-", 5, None),
    ("hub:nrsk-q-algo-", 5, None),
    ("hub:nrsk-q-react-", 5, None),
    ("hub:nrsk-q-frontend-", 5, None),
    ("hub:nrsk-q-linux-", 5, None),
    ("hub:nrsk-q-docker-", 5, None),
    ("hub:nrsk-q-git-", 5, None),
    ("hub:nrsk-q-spring-", 5, None),
    ("hub:nrsk-q-django-", 5, None),
    ("hub:nrsk-q-postgres-", 5, None),
    ("hub:nrsk-q-redis-", 5, None),
    ("hub:nrsk-q-android-", 5, None),
    ("hub:nrsk-q-ios-", 5, None),
    ("hub:nrsk-q-swift-", 5, None),
    ("hub:nrsk-q-typescript-", 5, None),
    ("hub:nrsk-q-nodejs-", 5, None),
    ("hub:nrsk-q-qa-", 5, None),
    ("hub:nrsk-q-security-", 5, None),
    ("hub:nrsk-q-dotnet-", 5, None),
    ("hub:nrsk-q-cpp-", 5, None),
    ("hub:nrsk-q-scala-", 5, None),
    ("hub:nrsk-q-ruby-", 5, None),
    ("hub:nrsk-q-nlp-", 5, None),
    ("hub:nrsk-q-cv-", 5, None),
    ("hub:nrsk-q-stats-", 5, None),
    ("hub:nrsk-q-math-", 5, None),
    ("hub:nrsk-q-sd-", 5, None),
    ("hub:nrsk-q-db-", 5, None),
]
TASK_SCANS = [
    ("hub:nrsk-algo-", 4, None),
    ("hub:nrsk-task-", 4, None),
    ("classic_", 3, None),
    ("linalg_", 3, None),
    ("stat_", 3, None),
]
CATEGORY_GUESSES = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "Kotlin",
    "Rust",
    "C++",
    "PHP",
    "Ruby",
    "Scala",
    "SQL",
    "Алгоритмы",
    "Машинное обучение",
    "Data Science",
    "Аналитика",
    "Статистика",
    "NLP",
    "Computer Vision",
    "Базы данных",
    "System Design",
    "QA",
    "Android",
    "iOS",
    "React",
    "Node.js",
    "Безопасность",
    "Сети",
]


def load_server() -> tuple[str, str]:
    cfg = json.loads(MCP_CONFIG.read_text(encoding="utf-8"))
    server = cfg["mcpServers"]["nareshka"]
    auth = server["headers"]["Authorization"]
    if not auth.lower().startswith("bearer "):
        auth = f"Bearer {auth}"
    return server["url"], auth


def unwrap(body: dict) -> dict:
    result = body.get("result") or {}
    if isinstance(result.get("structuredContent"), dict):
        return result["structuredContent"]
    for block in result.get("content") or []:
        if isinstance(block, dict) and block.get("type") == "text":
            try:
                parsed = json.loads(block["text"])
            except json.JSONDecodeError:
                return {"text": block["text"]}
            if isinstance(parsed, dict):
                return parsed
    if body.get("error"):
        raise RuntimeError(json.dumps(body["error"], ensure_ascii=False)[:500])
    return result if isinstance(result, dict) else {"result": result}


def is_rate_text(data: dict) -> bool:
    blob = json.dumps(data, ensure_ascii=False).lower()
    return "too many" in blob or "rate limit" in blob or "too many requests" in blob


def is_missing(data: dict) -> bool:
    if data.get("status") in (400, 404, 422):
        return True
    text = str(data.get("text") or data.get("error") or "").lower()
    return "not found" in text or "не найден" in text


def outcome(data: dict) -> str:
    if is_rate_text(data):
        return "retry"
    if is_missing(data):
        return "miss"
    if usable(data):
        return "hit"
    if data.get("error") or data.get("missing"):
        return "retry"
    return "miss"


def flatten(data: dict) -> dict:
    for key in ("card", "item", "task", "question", "problem"):
        inner = data.get(key)
        if isinstance(inner, dict):
            return {**inner, **{k: value for k, value in data.items() if k != key}}
    return data


def pick_id(item: dict) -> str:
    for key in ("id", "qid", "question_id", "task_id", "card_id", "problem_id"):
        value = item.get(key)
        if value:
            return str(value)
    return ""


def has_body(row: dict) -> bool:
    for key in (
        "question_block",
        "question",
        "title",
        "name",
        "statement",
        "description",
        "answer_block",
        "answer",
        "solution",
        "prompt",
    ):
        value = row.get(key)
        if isinstance(value, str) and value.strip():
            return True
    return False


def usable(row: dict) -> bool:
    if is_rate_text(row) or is_missing(row) or row.get("error"):
        return False
    return has_body(row)


class RateLimited(RuntimeError):
    pass


class NetworkError(RuntimeError):
    pass


class Client:
    def __init__(self, url: str, auth: str) -> None:
        self.url = url
        self.auth = auth
        self.calls = 0

    def call(self, name: str, arguments: dict | None = None, *, optional: bool = False) -> dict:
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments or {}},
        }
        data = json.dumps(payload).encode()
        last_error: Exception | None = None
        attempt = 0
        while attempt < 6:
            time.sleep(PACE_SECONDS)
            self.calls += 1
            req = urllib.request.Request(self.url, data=data, method="POST")
            req.add_header("Content-Type", "application/json")
            req.add_header("Accept", "application/json, text/event-stream")
            req.add_header("Authorization", self.auth)
            try:
                with urllib.request.urlopen(req, timeout=20) as res:
                    parsed = flatten(unwrap(json.loads(res.read().decode())))
            except urllib.error.HTTPError as exc:
                last_error = exc
                if exc.code == 429:
                    print(f"  429 on {name}", flush=True)
                    raise RateLimited(name) from exc
                if optional and exc.code in (400, 404, 422):
                    return {"missing": True, "status": exc.code}
                attempt += 1
                time.sleep(2)
                continue
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                last_error = exc
                attempt += 1
                if attempt >= 3:
                    print(f"  network error on {name}", flush=True)
                    raise NetworkError(name) from exc
                print(f"  network error on {name}, retry {attempt}", flush=True)
                time.sleep(2)
                continue
            if is_rate_text(parsed):
                print(f"  rate limit on {name}", flush=True)
                raise RateLimited(name)
            return parsed
        if optional:
            return {"missing": True, "error": str(last_error)}
        raise RuntimeError(f"{name} failed: {last_error}")


class Store:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)
        self.state_path = root / "export-state.json"
        self.state = {"queries": [], "scans": {}}
        if self.state_path.exists():
            try:
                loaded = json.loads(self.state_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                loaded = {}
            if isinstance(loaded, dict):
                self.state.update(loaded)
        self.done_queries = set(self.state.get("queries") or [])
        self.gaps: list[dict] = []

    def save(self) -> None:
        self.state["queries"] = sorted(self.done_queries)
        self.state_path.write_text(
            json.dumps(self.state, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    def load_ids(self, filename: str, id_key: str) -> set[str]:
        path = self.root / filename
        found: set[str] = set()
        if not path.exists():
            return found
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            item_id = str(row.get(id_key) or "")
            if item_id and usable(row):
                found.add(item_id)
        return found

    def append(self, filename: str, row: dict) -> None:
        path = self.root / filename
        with path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    def note_gap(self, kind: str, detail: str, total: int, got: int) -> None:
        row = {"kind": kind, "detail": detail, "total": total, "got": got}
        self.gaps.append(row)
        self.append("gaps.jsonl", row)
        print(f"  gap {kind}: {detail} got {got}/{total}", flush=True)


def search_page(client: Client, name: str, arguments: dict, page: int = 1) -> tuple[list[dict], int]:
    data = client.call(name, {**arguments, "limit": 25, "page": page})
    items: list[dict] = []
    for key in ("items", "questions", "tasks", "results", "cards"):
        raw = data.get(key)
        if isinstance(raw, list):
            items = [item for item in raw if isinstance(item, dict)]
            break
    total = data.get("total")
    if total is None:
        total = len(items)
    return items, int(total)


def page_two_has_more(client: Client, name: str, arguments: dict) -> bool:
    first, _ = search_page(client, name, arguments, 1)
    second, _ = search_page(client, name, arguments, 2)
    first_ids = {pick_id(item) for item in first}
    fresh = [item for item in second if pick_id(item) and pick_id(item) not in first_ids]
    print(
        f"  page probe {name}: page1 {len(first_ids)} page2 new {len(fresh)}",
        flush=True,
    )
    return bool(fresh)


def save_fetched(
    client: Client,
    store: Store,
    filename: str,
    id_key: str,
    done: set[str],
    item_id: str,
    getter,
) -> None:
    if not item_id or item_id in done:
        return
    full = getter()
    if is_rate_text(full):
        print(f"  still rate limited, skip {item_id}", flush=True)
        return
    if is_missing(full) or not usable(full):
        return
    full[id_key] = item_id
    store.append(filename, full)
    done.add(item_id)


def scan_prefix(
    client: Client,
    store: Store,
    filename: str,
    id_key: str,
    done: set[str],
    prefix: str,
    width: int,
    known: int | None,
    getter,
) -> None:
    scans = store.state.setdefault("scans", {})
    cursor = scans.get(prefix) or {}
    start = int(cursor.get("next") or 1)
    found = int(cursor.get("found") or 0)
    if cursor.get("done"):
        print(f"  {prefix} already scanned ({found})", flush=True)
        return
    probes = [1, 50, 200]
    if start == 1 and known is None:
        hit = False
        for probe in probes:
            item_id = f"{prefix}{probe:0{width}d}"
            data = getter(item_id)
            kind = outcome(data)
            if kind == "retry":
                scans[prefix] = {"done": False, "found": found, "next": 1}
                store.save()
                raise RuntimeError(f"stopped on {item_id}, run the same command again")
            if kind != "hit":
                continue
            hit = True
            data[id_key] = item_id
            if item_id not in done:
                store.append(filename, data)
                done.add(item_id)
            break
        if not hit:
            scans[prefix] = {"done": True, "found": 0, "next": 1}
            store.save()
            print(f"  {prefix} no numbered ids", flush=True)
            return
    print(f"  scan {prefix} from {start}", flush=True)
    index = start
    miss_streak = 0
    retries = 0
    while index <= 15000:
        item_id = f"{prefix}{index:0{width}d}"
        if item_id not in done:
            try:
                data = getter(item_id)
            except (RateLimited, NetworkError, KeyboardInterrupt):
                scans[prefix] = {"next": index, "found": found, "done": False}
                store.save()
                raise
            kind = outcome(data)
            if kind == "retry":
                retries += 1
                if retries >= 3:
                    scans[prefix] = {"next": index, "found": found, "done": False}
                    store.save()
                    raise RuntimeError(f"stopped on {item_id}, run the same command again")
                print(f"  retry {item_id}", flush=True)
                time.sleep(15)
                continue
            retries = 0
            if kind == "miss":
                miss_streak += 1
            else:
                miss_streak = 0
                found += 1
                data[id_key] = item_id
                store.append(filename, data)
                done.add(item_id)
        else:
            miss_streak = 0
            found += 1
        if index % 50 == 0:
            print(f"  {prefix}{index:0{width}d} saved {len(done)} this-prefix {found}", flush=True)
            scans[prefix] = {"next": index + 1, "found": found, "done": False}
            store.save()
        passed_known = index > (known or 0)
        stop_for_gap = miss_streak >= (250 if known else 400) and passed_known
        stop_for_count = known is not None and found >= known and miss_streak >= 40
        if stop_for_gap or stop_for_count:
            break
        index += 1
    scans[prefix] = {"next": index + 1, "found": found, "done": True}
    store.save()
    print(f"  {prefix} done, hits {found}", flush=True)


def harvest_query(
    client: Client,
    store: Store,
    filename: str,
    id_key: str,
    done: set[str],
    search_name: str,
    arguments: dict,
    getter,
    depth: int = 0,
) -> None:
    signature = search_name + "|" + json.dumps(arguments, ensure_ascii=False, sort_keys=True)
    if signature in store.done_queries:
        return
    items, total = search_page(client, search_name, arguments, 1)
    fresh_ids = []
    for item in items:
        item_id = pick_id(item)
        if item_id and item_id not in done:
            fresh_ids.append(item_id)
    for item_id in fresh_ids:
        save_fetched(
            client,
            store,
            filename,
            id_key,
            done,
            item_id,
            lambda item_id=item_id: getter(item_id),
        )
    label = arguments.get("q") or arguments.get("deck") or arguments.get("category") or "*"
    print(
        f"  {search_name} {label!r} +{len(fresh_ids)} page {len(items)}/{total} file {len(done)}",
        flush=True,
    )
    if total <= max(len(items), 1) or depth >= 4:
        if total > len(items):
            store.note_gap(search_name, signature, total, len(items))
        store.done_queries.add(signature)
        store.save()
        return
    narrowed = False
    query = str(arguments.get("q") or "")
    for letter in SAMPLE_LETTERS:
        child = {**arguments, "q": query + letter}
        child_items, child_total = search_page(client, search_name, child, 1)
        child_ids = []
        for item in child_items:
            item_id = pick_id(item)
            if item_id and item_id not in done:
                child_ids.append(item_id)
        for item_id in child_ids:
            save_fetched(
                client,
                store,
                filename,
                id_key,
                done,
                item_id,
                lambda item_id=item_id: getter(item_id),
            )
        if 0 < child_total < total or child_ids:
            narrowed = True
            break
    if not narrowed:
        store.note_gap(search_name, signature, total, len(items))
        store.done_queries.add(signature)
        store.save()
        return
    for letter in LETTERS:
        harvest_query(
            client,
            store,
            filename,
            id_key,
            done,
            search_name,
            {**arguments, "q": query + letter},
            getter,
            depth + 1,
        )
    store.done_queries.add(signature)
    store.save()


def theory_getter(client: Client, item_id: str) -> dict:
    return client.call(
        "nareshka_theory_get_card",
        {"card_id": item_id, "include_answer": True},
        optional=True,
    )


def task_getter(client: Client, item_id: str) -> dict:
    return client.call(
        "nareshka_task_get",
        {"task_id": item_id, "include_code": True, "include_tests": "public"},
        optional=True,
    )


def all_decks(client: Client) -> list[dict]:
    merged: dict[str, dict] = {}
    categories: set[str] = set(CATEGORY_GUESSES)

    def absorb(data: dict) -> None:
        for item in data.get("items") or []:
            if not isinstance(item, dict):
                continue
            name = item.get("deck")
            if not name:
                continue
            merged[name] = item
            if item.get("category"):
                categories.add(item["category"])

    absorb(client.call("nareshka_theory_decks", {"include_progress": False, "limit": 200}))
    for category in sorted(categories):
        absorb(
            client.call(
                "nareshka_theory_decks",
                {"include_progress": False, "limit": 200, "category": category},
            )
        )
    return list(merged.values())


def deck_counts(store: Store) -> dict[str, int]:
    counts: dict[str, int] = {}
    path = store.root / "theory.jsonl"
    if not path.exists():
        return counts
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not usable(row):
            continue
        name = row.get("deck")
        if name:
            counts[name] = counts.get(name, 0) + 1
    return counts


def export_ml_problems(client: Client, store: Store) -> None:
    tree = client.call(
        "nareshka_ml_problems_tree",
        {"include_problems": True, "limit_per_category": 500},
    )
    (store.root / "ml-problems-tree.json").write_text(
        json.dumps(tree, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    done = store.load_ids("ml-problems.jsonl", "problem_id")
    ids: list[str] = []
    for category in tree.get("items") or []:
        if not isinstance(category, dict):
            continue
        declared = int(category.get("problem_count") or 0)
        problems = category.get("problems") or []
        if declared > len(problems):
            store.note_gap(
                "ml-problems",
                str(category.get("id")),
                declared,
                len(problems),
            )
        for problem in problems:
            if isinstance(problem, dict) and problem.get("id"):
                ids.append(str(problem["id"]))
    fresh = 0
    for problem_id in dict.fromkeys(ids):
        if problem_id in done:
            continue
        answer = client.call(
            "nareshka_ml_problem_get_answer",
            {"problem_id": problem_id},
            optional=True,
        )
        answer["problem_id"] = problem_id
        if is_missing(answer) or not usable(answer):
            store.append("ml-problems.jsonl", answer)
            print(f"  ml problem {problem_id} has no answer payload", flush=True)
            continue
        store.append("ml-problems.jsonl", answer)
        done.add(problem_id)
        fresh += 1
        time.sleep(0)
    print(f"ml-problems.jsonl: saved {fresh} new, usable {len(done)}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    url, auth = load_server()
    client = Client(url, auth)
    store = Store(args.out)
    print(f"writing {store.root}", flush=True)
    try:
        decks_path = store.root / "theory-decks.json"
        if decks_path.exists():
            decks = json.loads(decks_path.read_text(encoding="utf-8")).get("items") or []
            print(f"decks {len(decks)} from file", flush=True)
        else:
            decks = all_decks(client)
            decks_path.write_text(
                json.dumps({"items": decks}, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"decks {len(decks)}", flush=True)
        theory_done = store.load_ids("theory.jsonl", "id")
        print(f"theory: usable already {len(theory_done)}", flush=True)

        paging = False
        if "page_works" in store.state:
            paging = bool(store.state["page_works"])
        else:
            large = next((deck for deck in decks if int(deck.get("card_count") or 0) > 40), None)
            if large and large.get("deck"):
                paging = page_two_has_more(
                    client,
                    "nareshka_theory_search",
                    {"deck": large["deck"]},
                )
            store.state["page_works"] = paging
            store.save()

        for prefix, width, known in THEORY_SCANS:
            scan_prefix(
                client,
                store,
                "theory.jsonl",
                "id",
                theory_done,
                prefix,
                width,
                known,
                lambda item_id: theory_getter(client, item_id),
            )

        saved = deck_counts(store)
        for deck in decks:
            name = deck.get("deck")
            card_count = int(deck.get("card_count") or 0)
            if not name or not card_count:
                continue
            if saved.get(name, 0) >= card_count:
                continue
            if paging:
                page = 1
                while page <= 400:
                    items, total = search_page(
                        client,
                        "nareshka_theory_search",
                        {"deck": name},
                        page,
                    )
                    if not items:
                        break
                    for item in items:
                        item_id = pick_id(item)
                        save_fetched(
                            client,
                            store,
                            "theory.jsonl",
                            "id",
                            theory_done,
                            item_id,
                            lambda item_id=item_id: theory_getter(client, item_id),
                        )
                    if len(items) < 25 or page * 25 >= total:
                        break
                    page += 1
            else:
                harvest_query(
                    client,
                    store,
                    "theory.jsonl",
                    "id",
                    theory_done,
                    "nareshka_theory_search",
                    {"deck": name},
                    lambda item_id: theory_getter(client, item_id),
                )
            saved = deck_counts(store)
            print(f"  theory so far {len(theory_done)}", flush=True)

        task_done = store.load_ids("tasks.jsonl", "id")
        print(f"tasks: usable already {len(task_done)}", flush=True)
        for prefix, width, known in TASK_SCANS:
            scan_prefix(
                client,
                store,
                "tasks.jsonl",
                "id",
                task_done,
                prefix,
                width,
                known,
                lambda item_id: task_getter(client, item_id),
            )
        for word in WORDS:
            harvest_query(
                client,
                store,
                "tasks.jsonl",
                "id",
                task_done,
                "nareshka_tasks_search",
                {"q": word},
                lambda item_id: task_getter(client, item_id),
            )

        ml_done = store.load_ids("ml-questions.jsonl", "qid")
        print(f"ml-questions: usable already {len(ml_done)}", flush=True)
        for word in WORDS:
            harvest_query(
                client,
                store,
                "ml-questions.jsonl",
                "qid",
                ml_done,
                "nareshka_ml_questions_search",
                {"q": word},
                lambda item_id: client.call(
                    "nareshka_ml_question_get_answer",
                    {"qid": item_id},
                    optional=True,
                ),
            )

        interview_done = store.load_ids("interview.jsonl", "question_id")
        print(f"interview: usable already {len(interview_done)}", flush=True)
        for word in WORDS:
            harvest_query(
                client,
                store,
                "interview.jsonl",
                "question_id",
                interview_done,
                "nareshka_interview_search_questions",
                {"q": word},
                lambda item_id: client.call(
                    "nareshka_interview_get_question",
                    {"question_id": item_id},
                    optional=True,
                ),
            )

        export_ml_problems(client, store)
        print(
            "done",
            f"theory {len(theory_done)}",
            f"tasks {len(task_done)}",
            f"ml-questions {len(ml_done)}",
            f"interview {len(interview_done)}",
            f"calls {client.calls}",
            f"-> {store.root}",
            flush=True,
        )
    except RateLimited:
        print("лимит запросов. прогресс сохранён, запусти ту же команду позже", flush=True)
    except NetworkError:
        print("сеть оборвалась. прогресс сохранён, запусти ту же команду снова", flush=True)
    except KeyboardInterrupt:
        print("остановлено. запусти ту же команду чтобы продолжить", flush=True)
    finally:
        store.save()


if __name__ == "__main__":
    main()
