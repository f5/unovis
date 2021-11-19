# ![](icon.svg) Volterra Vis: Data Visualization Building Blocks
![](cover.png)

Volterra Vis is a collection of composable data visualization modules empowering the creation
of complex UI components for visual analytics.

The library is written in Typescript and can be used without a UI framework. We also provide React and Angular wrappers
for a smoother dev experience.



## Installation
To install *@volterra/vis* you'll first need to add the Gitlab registry where the NPM package is located.
You can do that either by adding the following lines to your **.npmrc** file:
```bash
@volterra:registry=https://gitlab.com/api/v4/projects/31255670/packages/npm/
```
or by executing the following command in Terminal:
```bash
npm config set @volterra:registry https://gitlab.com/api/v4/projects/31255670/packages/npm/
```

After adding the registry you should be able in install the libraries for your project.

To use with React:
```bash
npm install -P @volterra/vis @volterra/vis-react
```
If you use Angular:
```bash
npm install -P @volterra/vis @volterra/vis-react
```

## Usage
Check our demo app and Angular / React storybooks for usage examples and the documentation. More learning resources coming soon!

Demo: http://volterra.io.gitlab.io/volterra-vis

Angular Storybook: http://volterra.io.gitlab.io/volterra-vis/storybook-angular

React Storybook: http://volterra.io.gitlab.io/volterra-vis/storybook-react

## Repository structure

`packages/vis` Visualization library

`packages/vis-angular` Angular wrapper and Storybook documentation with examples

`packages/vis-react` React wrapper and Storybook documentation with examples

`packages/dev-demo` Angular-based demo app for development purposes
