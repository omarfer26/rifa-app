// app/page.tsx or pages/index.tsx
import NumberTable from '@/components/numeros-rifa'

export default function Home() {
  return (
      <main className="min-h-screen p-4">
        <NumberTable />
      </main>
  )
}