cd packages/vis-angular
npm run generate

git add .
git commit -m "Vis Angular | Wrappers: Automated update" -m "ref #0"


cd ../vis-react
npm run generate

git add .
git commit -m "Vis React | Wrappers: Automated update"  -m "ref #0"

cd ../vis-svelte
npm run generate

git add .
git commit -m "Vis Svelte | Wrappers: Automated update"  -m "ref #0"
