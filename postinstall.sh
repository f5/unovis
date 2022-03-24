echo "Building @volterra/vis"
npm run build:lib
npm run build:vis-angular-lib
npm run build:vis-react-lib

echo "Updating licenses"
npm run gather-licenses

# We need to install @volterra/website dependencies separately otherwise it won't run and build
echo "Installing @volterra/website dependencies"
cd packages/website
npm i --silent
rm -rf node_modules/react
rm -rf node_modules/react-dom
