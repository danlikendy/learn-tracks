export function Placeholder({ title }: { title: string }) {
  return (
    <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-8">
      <h1 className="font-serif text-3xl">{title}</h1>
      <p className="mt-4 max-w-xl text-[var(--muted)]">
        Раздел запланирован. Сюда позже попадут вкладки сообщества, обучения,
        роадмапов и обзоров — после того как закрепим текущие материалы.
      </p>
    </section>
  )
}
