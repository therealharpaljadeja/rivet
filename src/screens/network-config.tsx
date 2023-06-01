import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useHref, useNavigate } from 'react-router-dom'

import { getPublicClient } from '../viem'
import { Container } from '~/components'
import { Button, Inline, Input, Stack, Text } from '~/design-system'
import { useDebounce } from '~/hooks'
import { useNetwork } from '~/zustand'

export default function NetworkConfig() {
  const { network, updateNetwork } = useNetwork()

  type FormValues = {
    name: string
    rpcUrl: string
  }
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { name: network.name, rpcUrl: network.rpcUrl },
  })

  const debouncedRpcUrl = useDebounce(watch('rpcUrl'), 300)
  const { data: chainId, isError: isOffline } = useQuery({
    enabled: Boolean(debouncedRpcUrl),
    queryKey: ['chainId', debouncedRpcUrl],
    queryFn: async () => {
      const publicClient = getPublicClient({ rpcUrl: debouncedRpcUrl })
      return publicClient.getChainId()
    },
  })

  const navigate = useNavigate()
  const href = useHref('/')

  const onSubmit = handleSubmit(async ({ name, rpcUrl }) => {
    await updateNetwork({ name, rpcUrl })
    navigate('/')
  })

  return (
    <form onSubmit={onSubmit} style={{ height: '100%' }}>
      <Container
        header={<Text size='16px'>Network</Text>}
        footer={
          <Inline gap='8px' wrap={false}>
            <Button as='a' href={href} variant='stroked scrim'>
              Back
            </Button>
            <Button type='submit'>Update</Button>
          </Inline>
        }
      >
        <Stack gap='20px'>
          <Stack gap='12px'>
            <Text color='label' size='12px' weight='medium'>
              CHAIN ID
            </Text>
            <Input
              disabled
              name='chainId'
              placeholder='1'
              value={chainId || network.chainId}
            />
          </Stack>
          <Stack gap='8px'>
            <Stack gap='12px'>
              <Text color='label' size='12px' weight='medium'>
                RPC URL
              </Text>
              <Input
                placeholder='http://localhost:8545'
                state={isOffline ? 'warning' : undefined}
                {...register('rpcUrl', { required: true })}
              />
            </Stack>
            {isOffline && (
              <Text color='yellow' size='11px'>
                Warning: Network is offline
              </Text>
            )}
          </Stack>
          <Stack gap='12px'>
            <Text color='label' size='12px' weight='medium'>
              NAME
            </Text>
            <Input placeholder='Ethereum' {...register('name')} />
          </Stack>
        </Stack>
      </Container>
    </form>
  )
}