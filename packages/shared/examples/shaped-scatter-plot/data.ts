export type DataRecord = {
  name: string;
  owner: string;
  trainedParam: number;
  date: string;
};


export const categories = [
  'Amazon',
  'Anthropic',
  'OpenAI',
  'Google',
  'Meta',
  'Other',
]

export const shapes = [
  'circle',
  'cross',
  'diamond',
  'square',
  'star',
  'triangle',
]

export const sumCategories = (category: string): string => {
  return categories.indexOf(category) === -1 ? 'Other' : category
}

export const data = [
  { name: 'Claude 3', owner: 'Anthropic', trainedParam: 2000, date: 'Mar-2024' },
  { name: 'Wu Dao 2.0', owner: 'Chinese', trainedParam: 1750, date: 'Jan-2021' },
  { name: 'Gemini Ultra', owner: 'Google', trainedParam: 1500, date: 'Dec-2023' },
  { name: 'Gemini Pro 1.5', owner: 'Google', trainedParam: 1500, date: 'Feb-2024' },
  { name: 'GLaM', owner: 'Google', trainedParam: 1200, date: 'Dec-2021' },
  { name: 'Inflection-202', owner: 'Inflection', trainedParam: 1200, date: 'Nov-2023' },
  { name: 'Inflection-202.5', owner: 'Inflection', trainedParam: 1200, date: 'Mar-2024' },
  { name: 'PanGu-Sigma', owner: 'Chinese', trainedParam: 1085, date: 'Mar-2023' },
  { name: 'GPT-4*', owner: 'OpenAI', trainedParam: 1000, date: 'Mar-2023' },
  { name: 'BingChat*', owner: 'Microsoft', trainedParam: 1000, date: 'Apr-2023' },
  { name: 'Ernie 4.0', owner: 'Chinese', trainedParam: 1000, date: 'Oct-2023' },
  { name: 'GPT-4 Turbo', owner: 'Open AI', trainedParam: 1000, date: 'Nov-2023' },
  { name: 'PaLM', owner: 'Google', trainedParam: 540, date: 'Apr-2022' },
  { name: 'Minerva', owner: 'Google', trainedParam: 540, date: 'Jun-2022' },
  { name: 'PaLM2', owner: 'Google', trainedParam: 540, date: 'May-2023' },
  { name: 'Mistral-large', owner: 'Mistral AI', trainedParam: 540, date: 'Feb-2024' },
  { name: 'Megatron-Turing NLG', owner: 'Meta', trainedParam: 530, date: 'Oct-2021' },
  { name: 'MT-NLG', owner: 'Microsoft', trainedParam: 530, date: 'Oct-2021' },
  { name: '530B', owner: 'Chinese', trainedParam: 530, date: 'Feb-2024' },
  { name: 'BERT-480', owner: 'Google', trainedParam: 480, date: 'Nov-2021' },
  { name: 'Titan', owner: 'Amazon', trainedParam: 350, date: 'Apr-2023' },
  { name: 'Grok 1', owner: 'Twitter', trainedParam: 314, date: 'Nov-2023' },
  { name: 'Exaone', owner: 'LG', trainedParam: 300, date: 'Dec-2022' },
  { name: 'Gopher', owner: 'Google', trainedParam: 280, date: 'Dec-2021' },
  { name: 'Ernie 3.0 Titan', owner: 'Chinese', trainedParam: 260, date: 'Dec-2021' },
  { name: 'PanGu-Alpha', owner: 'Huawei', trainedParam: 200, date: 'Apr-2021' },
  { name: 'BERT-20200', owner: 'Google', trainedParam: 200, date: 'Nov-2021' },
  { name: 'Luminous', owner: 'Aleph Alpha', trainedParam: 200, date: 'Nov-2021' },
  { name: 'Ernie Bot', owner: 'Chinese', trainedParam: 200, date: 'Dec-2021' },
  { name: 'Jurassic-202*', owner: 'AI21', trainedParam: 200, date: 'Mar-2023' },
  { name: 'SenseChat', owner: 'SenseTime', trainedParam: 200, date: 'Apr-2023' },
  { name: 'Tongyi Qianwen', owner: 'Chinese', trainedParam: 200, date: 'Apr-2023' },
  { name: 'Ernie Bot 3.5', owner: 'Chinese', trainedParam: 200, date: 'Jul-2023' },
  { name: 'GLM-4', owner: 'Zhipu AI', trainedParam: 200, date: 'Jan-2024' },
  { name: 'Xinghuo 3.5', owner: 'Chinese', trainedParam: 200, date: 'Jan-2024' },
  { name: 'Falcon 180B', owner: 'TII', trainedParam: 180, date: 'Sep-2023' },
  { name: 'Q', owner: 'Amazon', trainedParam: 180, date: 'Dec-2023' },
  { name: 'Mistral-medium', owner: 'Mistral AI', trainedParam: 180, date: 'Dec-2023' },
  { name: 'Jurassic-1', owner: 'AI21', trainedParam: '178', date: 'Aug-2021' },
  { name: 'GPT-3', owner: 'OpenAI', trainedParam: 175, date: 'May-2020' },
  { name: 'OPT-IML', owner: 'Meta', trainedParam: 175, date: 'May-2022' },
  { name: 'BLOOM', owner: 'BigScience', trainedParam: 175, date: 'Jul-2022' },
  { name: 'BlenderBot3', owner: 'Meta', trainedParam: 175, date: 'Aug-2022' },
  { name: 'GPT 3.5', owner: 'OpenAI', trainedParam: 175, date: 'Dec-2022' },
  { name: 'WebGPT', owner: 'Microsoft', trainedParam: 175, date: 'Jan-2023' },
  { name: '175B', owner: 'Chinese', trainedParam: 175, date: 'Feb-2024' },
  { name: 'LaMDA', owner: 'Google', trainedParam: 137, date: 'Jun-2021' },
  { name: 'FLAN', owner: 'Google', trainedParam: 137, date: 'Sep-2021' },
  { name: 'GLM-130B', owner: 'Chinese', trainedParam: 130, date: 'Aug-2022' },
  { name: 'Claude 2.1', owner: 'Anthropic', trainedParam: 130, date: 'Nov-2023' },
  { name: 'Galactica', owner: 'Meta', trainedParam: 120, date: 'Nov-2022' },
  { name: 'Fuyu-heavy', owner: 'Adept', trainedParam: 120, date: 'Jan-2024' },
  { name: 'Yuan 2.0', owner: 'IEIT', trainedParam: 102, date: 'Nov-2023' },
  { name: 'YaLM 100B', owner: 'Yandex', trainedParam: 100, date: 'Jun-2022' },
  { name: 'IDEFICS', owner: 'Independent', trainedParam: 80, date: 'Aug-2023' },
  { name: 'Qwen 1.5', owner: 'Chinese', trainedParam: 72, date: 'Feb-2024' },
  { name: 'Chinchilla', owner: 'DeepMind', trainedParam: 70, date: 'Mar-2022' },
  { name: 'Sparrow', owner: 'Google', trainedParam: 70, date: 'Sep-2022' },
  { name: 'Luminous Supreme', owner: 'Aleph Alpha', trainedParam: 70, date: 'Feb-2023' },
  { name: 'LLaMa2', owner: 'Facebook', trainedParam: 70, date: 'Jul-2023' },
  { name: 'MEDITRON', owner: 'EPFL', trainedParam: 70, date: 'Nov-2023' },
  { name: 'pplx-70b', owner: 'Perplexity', trainedParam: 70, date: 'Nov-2023' },
  { name: 'DeepSeek', owner: 'Wenge', trainedParam: 67, date: 'Jan-2024' },
  { name: 'LLaMa', owner: 'Meta', trainedParam: 65, date: 'Feb-2023' },
  { name: 'StableLM', owner: 'Stability AI', trainedParam: 65, date: 'Apr-2023' },
  { name: 'Vicuna-13B', owner: 'Vicuna Team', trainedParam: 65, date: 'Mar-2023' },
  { name: 'NLLB-20200', owner: 'Meta', trainedParam: 54.5, date: 'Jul-2022' },
  { name: 'xlarge', owner: 'Cohere', trainedParam: 52.4, date: 'Sep-2021' },
  { name: 'RL-CAI', owner: 'Anthropic', trainedParam: 52, date: 'Dec-2022' },
  { name: 'Claude', owner: 'Anthropic', trainedParam: 52, date: 'Jan-2023' },
  { name: 'Claude 2', owner: 'Anthropic', trainedParam: 52, date: 'Jul-2023' },
  { name: 'Claude Instant', owner: 'Anthropic', trainedParam: 52, date: 'Aug-2023' },
  { name: 'BloombergGPT', owner: 'Bloomberg', trainedParam: 50, date: 'Mar-2023' },
]


