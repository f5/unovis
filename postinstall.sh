echo "Activating git hooks"
npx husky install

echo "Building @volterra/vis"
npm run build:lib
npm run build:vis-angular-lib
npm run build:vis-react-lib
npm run build:vis-svelte-lib


# We need to install @volterra/website dependencies separately otherwise it won't run and build
echo "Installing @volterra/website dependencies"
cd packages/website
npm i --silent
rm -rf node_modules/react
rm -rf node_modules/react-dom

echo "📄 Updating licenses (will be done in the background)"
npm run gather-licenses > /dev/null 2>&1 &
