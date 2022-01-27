echo "Building @volterra/vis"
npm run build:lib

echo "Updating licenses"
npm run gather-licenses

# We need to install @volterra/vis-react dependencies separately otherwise Storybook won't run and build
echo "Installing @volterra/vis-react dependencies"
cd packages/vis-react
npm i --silent
rm -rf node_modules/@volterra/vis
