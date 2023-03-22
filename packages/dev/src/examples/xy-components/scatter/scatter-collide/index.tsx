import React from 'react'
import { VisXYContainer, VisScatter } from '@unovis/react'

import data from './blockchain_hacks.json'

export const title = 'Scatter with Collide'
export const subTitle = 'Blockchain hacks'
export const category = 'Scatter'

type BlockchainHackDatum = {
  name: string;
  type: string;
  date: string;
  amount: string;
  amountText: string;
  currency: string;
  description: string;
  url: string;
  location: string;
  dateYYYYMMDD: string;
}

export const component = (): JSX.Element => {
  return (
    <VisXYContainer data={data} margin={{ top: 5, left: 5 }} yDomain={[-10, 10]} height={'10vh'}>
      <VisScatter<BlockchainHackDatum>
        x={d => Date.parse(d.dateYYYYMMDD)}
        y={d => 0}
        size={d => +d.amount}
        sizeRange={[10, 100]}
      />
    </VisXYContainer>
  )
}
