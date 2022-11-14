cd packages/angular
npm run generate
git add .
git commit -m "Vis Angular | Wrappers: Automated update"


cd ../react
npm run generate

git add .
git commit -m "Vis React | Wrappers: Automated update"

cd ../svelte
npm run generate

git add .
git commit -m "Vis Svelte | Wrappers: Automated update"
