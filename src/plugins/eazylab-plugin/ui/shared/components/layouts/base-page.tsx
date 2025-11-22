
export interface BasePageProps {
  title?: string
  children?: React.ReactNode
}

export function BasePage ({title="",children}: BasePageProps) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="">{children}</div>
    </div>
  )
}
