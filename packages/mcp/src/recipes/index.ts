import type { AnyRecipe } from './types.js'

import { lineRecipe } from './line.js'
import { areaRecipe } from './area.js'
import { barRecipe } from './bar.js'
import { scatterRecipe } from './scatter.js'
import { donutRecipe } from './donut.js'
import { timelineRecipe } from './timeline.js'
import { boxplotRecipe } from './boxplot.js'
import { sankeyRecipe } from './sankey.js'
import { heatmapRecipe } from './heatmap.js'
import { treemapRecipe } from './treemap.js'
import { chordRecipe } from './chord.js'
import { nestedDonutRecipe } from './nested-donut.js'
import { radialBarRecipe } from './radial-bar.js'
import { graphRecipe } from './graph.js'
import { choroplethRecipe } from './choropleth.js'

export type { Recipe, AnyRecipe } from './types.js'

/** All available chart recipes, in display order */
export const recipes: AnyRecipe[] = [
  lineRecipe,
  areaRecipe,
  barRecipe,
  scatterRecipe,
  donutRecipe,
  timelineRecipe,
  boxplotRecipe,
  sankeyRecipe,
  heatmapRecipe,
  treemapRecipe,
  chordRecipe,
  nestedDonutRecipe,
  radialBarRecipe,
  graphRecipe,
  choroplethRecipe,
]

export const recipeByName = new Map(recipes.map(r => [r.name, r]))
