import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { LevelForm } from '@/components/LevelForm'

export default async function AdminLevelsPage() {
  const supabase = createServerClient()

  const { data: levels } = await supabase
    .from('levels')
    .select('*')
    .order('position')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Levels</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Level</h2>
            <LevelForm />
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Levels</h2>
          <div className="space-y-2">
            {levels?.map((level) => (
              <Card key={level.id}>
                <CardContent className="p-4">
                  <h3 className="font-medium">{level.name}</h3>
                </CardContent>
              </Card>
            ))}
            {(!levels || levels.length === 0) && (
              <p className="text-muted-foreground">No levels yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

