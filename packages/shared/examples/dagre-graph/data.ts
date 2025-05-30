export type NodeDatum = {
  id: string;
  label: string;
  shape: string;
  color: string;
}

export type LinkDatum = {
  id: string;
  source: string;
  target: string;
  active: boolean;
  color: string;
}

export type GraphData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export const links: LinkDatum[] = [
  {
    id: ':S:cartservice.app~:S:cart.app',
    source: 'S:cartservice.app',
    target: 'S:cart.app',
    active: true,
    color: '#35D068',
  },
  {
    id: ':S:cartservice.app~:S:cartservice.app',
    source: 'S:cartservice.app',
    target: 'S:cartservice.app',
    active: true,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:adservice.app',
    source: 'N:vk8s-service-network',
    target: 'S:adservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:cartservice.app',
    source: 'N:vk8s-service-network',
    target: 'S:cartservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:checkoutservice.app',
    source: 'N:vk8s-service-network',
    target: 'S:checkoutservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:currencyservice.app',
    source: 'N:vk8s-service-network',
    target: 'S:currencyservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:productcatalogservice.app',
    source: 'N:vk8s-service-network',
    target: 'S:productcatalogservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:recommendationservice.app',
    source: 'N:vk8s-service-network',
    target: 'S:recommendationservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:shippingservice.app',
    source: 'N:vk8s-service-network',
    target: 'S:shippingservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:vk8s-service-network~:S:cart.app',
    source: 'N:vk8s-service-network',
    target: 'S:cart.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':S:frontend.app~:S:cartservice.app',
    source: 'S:frontend.app',
    target: 'S:cartservice.app',
    active: true,
    color: '#F94627',
  },
  {
    id: ':S:frontend.app~:S:adservice.app',
    source: 'S:frontend.app',
    target: 'S:adservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':S:frontend.app~:S:currencyservice.app',
    source: 'S:frontend.app',
    target: 'S:currencyservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':S:frontend.app~:S:productcatalogservice.app',
    source: 'S:frontend.app',
    target: 'S:productcatalogservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':S:frontend.app~:S:recommendationservice.app',
    source: 'S:frontend.app',
    target: 'S:recommendationservice.app',
    active: true,
    color: '#35D068',
  },
  {
    id: ':S:frontend.app~:S:shippingservice.app',
    source: 'S:frontend.app',
    target: 'S:shippingservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':S:recommendationservice.app~:S:productcatalogservice.app',
    source: 'S:recommendationservice.app',
    target: 'S:productcatalogservice.app',
    active: false,
    color: '#35D068',
  },
  {
    id: ':N:public~:S:frontend.app',
    source: 'N:public',
    target: 'S:frontend.app',
    active: true,
    color: '#35D068',
  },
]

export const nodes: NodeDatum[] = [
  {
    id: 'S:cartservice.app',
    label: 'cartservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'N:vk8s-service-network',
    label: 'vk8s-service-network',
    shape: 'square',
    color: '#35D068',
  },
  {
    id: 'S:frontend.app',
    label: 'frontend.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:recommendationservice.app',
    label: 'recommendationservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:adservice.app',
    label: 'adservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:checkoutservice.app',
    label: 'checkoutservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:currencyservice.app',
    label: 'currencyservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:productcatalogservice.app',
    label: 'productcatalogservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:cart.app',
    label: 'cart.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:shippingservice.app',
    label: 'shippingservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'N:public',
    label: 'public',
    shape: 'square',
    color: '#35D068',
  },
  {
    id: 'S:emailservice.app',
    label: 'emailservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
  {
    id: 'S:paymentservice.app',
    label: 'paymentservice.app',
    shape: 'hexagon',
    color: '#35D068',
  },
]

export const data: GraphData = { nodes, links }
