import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface KPIProps {
  title: string
  value: string
  description?: string
}

export function KPI({ title, value, description }: KPIProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

