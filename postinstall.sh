echo "Activating git hooks"
npx husky install

echo "Building @unovis"
npm run build:ts
npm run build:angular
npm run build:react
npm run build:svelte
npm run build:vue


# We need to install @unovis/website dependencies separately otherwise it won't run and build
echo "🟡 Installing @unovis/website dependencies"
cd packages/website
npm i --silent --force
rm -rf node_modules/react
rm -rf node_modules/react-dom

# Same for the dev app
echo "🏗 Installing @unovis/dev dependencies"
cd ../dev
npm i --silent

echo "📄 Updating licenses (will be done in the background)"
cd ../../
npm run gather-licenses > /dev/null 2>&1 &
