npm version patch --workspaces &&

npm run publish:lib &&

npm i @volterra/vis --save-peer --workspace=@volterra/vis-angular --workspace=@volterra/vis-react --force &&

npm run publish:vis-angular-lib &&
npm run publish:vis-react-lib &&

version=$(node -e "console.log(require('./packages/vis/package.json').version)") &&

git add . &&
git commit -m "Release: v${version}" -m "ref #129"
