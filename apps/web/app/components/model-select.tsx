import * as Select from '@radix-ui/react-select'
import { useQuery } from '@tanstack/react-query'
import { CheckIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { useTRPC } from '~/lib/trpc'

export function ModelSelect({ value, onChange, children }: PropsWithChildren<{ value: string; onChange: (value: string) => void }>) {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.chat.models.queryOptions())

  const usableData = data || ({} as Record<string, string[]>)

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger asChild>{children}</Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="overflow-hidden rounded-lg bg-zinc-800 px-1 pb-1 pt-2 border border-zinc-700 relative z-20 min-w-48 shadow-2xl"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport>
            {Object.keys(data || usableData).map((key, i) => (
              <Select.Group key={key} className={i > 0 ? 'mt-3' : ''}>
                <Select.Label className="text-sm text-zinc-400 px-1 mb-1">{key}</Select.Label>
                <div className="flex flex-col gap-0.5">
                  {usableData[key as keyof typeof usableData].map((value) => (
                    <Select.Item
                      key={value}
                      value={value}
                      className="px-2 py-0.5 cursor-pointer rounded-md flex justify-between items-center focus:outline-none focus-visible:outline-none focus-visible:bg-zinc-700 hover:bg-zinc-700"
                    >
                      <Select.ItemText>
                        <span className="text-sm">{value}</span>
                      </Select.ItemText>
                      <Select.ItemIndicator>
                        <CheckIcon size={14} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </div>
              </Select.Group>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
