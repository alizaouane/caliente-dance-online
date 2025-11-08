import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StyleForm } from '@/components/StyleForm'

export default async function AdminStylesPage() {
  const supabase = createServerClient()

  const { data: styles } = await supabase
    .from('styles')
    .select('*')
    .order('position')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dance Styles</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Style</h2>
            <StyleForm />
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Styles</h2>
          <div className="space-y-2">
            {styles?.map((style) => (
              <Card key={style.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{style.name}</h3>
                    <p className="text-sm text-muted-foreground">/{style.slug}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!styles || styles.length === 0) && (
              <p className="text-muted-foreground">No styles yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

