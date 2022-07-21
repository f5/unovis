# Disabling automatic version update till we find a better approach
# current_version=$(node -e "console.log(require('./packages/vis/package.json').version)") &&
# npm version patch --workspaces &&
new_version=$(node -e "console.log(require('./packages/vis/package.json').version)") &&

# Update versions
# perl -pi -e 's/${current_version}/${new_version}/g' *
# npm i --ignore-scripts

npm run publish:lib &&
npm run publish:vis-angular-lib &&
npm run publish:vis-react-lib &&
npm run publish:vis-svelte-lib &&


git add . &&
git commit -m "Release: v${new_version}" -m "ref #0"
