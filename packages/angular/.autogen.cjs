'use strict';

var fs = require('fs');
var child_process = require('child_process');
var ts = require('typescript');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var ts__default = /*#__PURE__*/_interopDefaultLegacy(ts);

function getComponentList(coreComponentConfigPath = '/core/component', xyComponentConfigPath = '/core/xy-component') {
    return [
        // XY Components
        { name: 'Area', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/area'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'Axis', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/axis'], dataType: 'Datum[]', angularProvide: 'VisXYComponent', elementSuffix: 'axis' },
        { name: 'Brush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/brush'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'Crosshair', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/crosshair'], dataType: 'Datum[]', angularProvide: 'VisXYComponent', elementSuffix: 'crosshair' },
        { name: 'FreeBrush', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/free-brush'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'GroupedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/grouped-bar'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'Line', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/line'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'Scatter', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/scatter'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'StackedBar', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/stacked-bar'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'Timeline', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/timeline'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'XYLabels', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/xy-labels'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        { name: 'Plotline', sources: [coreComponentConfigPath, xyComponentConfigPath, '/components/plotline'], dataType: 'Datum[]', angularProvide: 'VisXYComponent' },
        // Single components
        { name: 'ChordDiagram', sources: [coreComponentConfigPath, '/components/chord-diagram'], dataType: '{ nodes: N[]; links?: L[] }', angularProvide: 'VisCoreComponent' },
        { name: 'Donut', sources: [coreComponentConfigPath, '/components/donut'], dataType: 'Datum[]', angularProvide: 'VisCoreComponent' },
        { name: 'Graph', sources: [coreComponentConfigPath, '/components/graph'], dataType: '{ nodes: N[]; links?: L[] }', angularProvide: 'VisCoreComponent' },
        { name: 'NestedDonut', sources: [coreComponentConfigPath, '/components/nested-donut'], dataType: 'Datum[]', angularProvide: 'VisCoreComponent' },
        { name: 'Sankey', sources: [coreComponentConfigPath, '/components/sankey'], dataType: '{ nodes: N[]; links?: L[] }', angularProvide: 'VisCoreComponent' },
        { name: 'TopoJSONMap', kebabCaseName: 'topojson-map', sources: [coreComponentConfigPath, '/components/topojson-map'], dataType: '{areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]}', angularProvide: 'VisCoreComponent' },
        // Ancillary components
        { name: 'Tooltip', sources: ['/components/tooltip'], dataType: null, angularProvide: 'VisGenericComponent', elementSuffix: 'tooltip' },
        { name: 'Annotations', sources: [coreComponentConfigPath, '/components/annotations'], dataType: null, angularProvide: 'VisGenericComponent', elementSuffix: 'annotations' },
        // Standalone components
        { name: 'LeafletMap', sources: [coreComponentConfigPath, '/components/leaflet-map'], dataType: 'Datum[]', isStandAlone: true, angularProvide: 'VisCoreComponent', angularStyles: ['width: 100%', 'height: 100%', 'position: relative'], svelteStyles: ['display:block', 'position:relative'], vueStyles: ['display:block', 'position:relative'], solidStyles: ['display:"block"', 'position:"relative"'] },
        { name: 'LeafletFlowMap', sources: [coreComponentConfigPath, '/components/leaflet-map', '/components/leaflet-flow-map'], dataType: '{ points: PointDatum[]; flows?: FlowDatum[] }', isStandAlone: true, angularProvide: 'VisCoreComponent', angularStyles: ['width: 100%', 'height: 100%', 'position: relative'], svelteStyles: ['display:block', 'position:relative'], vueStyles: ['display:block', 'position:relative'], solidStyles: ['display:"block"', 'position:"relative"'] },
        { name: 'BulletLegend', sources: ['/components/bullet-legend'], dataType: null, angularProvide: 'VisGenericComponent', isStandAlone: true, svelteStyles: ['display:block'], vueStyles: ['display:block'], solidStyles: ['display:"block"'] },
    ];
}

function getTypeName(type) {
    var _a;
    switch (type.kind) {
        case (ts__default["default"].SyntaxKind.UnionType): return type.types.map(getTypeName).join(' | ');
        case (ts__default["default"].SyntaxKind.IntersectionType): return type.types.map(getTypeName).join(' & ');
        case (ts__default["default"].SyntaxKind.LiteralType): return getTypeName(type.literal);
        case (ts__default["default"].SyntaxKind.StringLiteral): return type.text;
        case (ts__default["default"].SyntaxKind.BooleanKeyword): return 'boolean';
        case (ts__default["default"].SyntaxKind.NumberKeyword): return 'number';
        case (ts__default["default"].SyntaxKind.StringKeyword): return 'string';
        case (ts__default["default"].SyntaxKind.NullKeyword): return 'null';
        case (ts__default["default"].SyntaxKind.UndefinedKeyword): return 'undefined';
        case (ts__default["default"].SyntaxKind.AnyKeyword): return 'any';
        case (ts__default["default"].SyntaxKind.VoidKeyword): return 'void';
        case (ts__default["default"].SyntaxKind.UnknownKeyword): return 'unknown';
        case (ts__default["default"].SyntaxKind.Parameter): {
            const p = type;
            const paramName = getTypeName(p.name);
            const paramType = p.type ? getTypeName(p.type) : undefined;
            const isRest = p.dotDotDotToken;
            return isRest
                ? '...rest'
                : (`${paramName}${p.questionToken ? '?' : ''}${paramType ? `: ${paramType}` : ''}`);
        }
        case (ts__default["default"].SyntaxKind.ObjectBindingPattern): return `{ ${type.elements.map(getTypeName).join(', ')} }`;
        case (ts__default["default"].SyntaxKind.BindingElement): return getTypeName(type.name);
        case (ts__default["default"].SyntaxKind.Identifier): return type.escapedText;
        case (ts__default["default"].SyntaxKind.QualifiedName): return `${getTypeName(type.left)}.${getTypeName(type.right)}`;
        case (ts__default["default"].SyntaxKind.TypeLiteral): return `{\n${type.members.map(getTypeName).join('\n')}\n}`;
        case (ts__default["default"].SyntaxKind.TypeParameter): {
            const t = type;
            return `${getTypeName(t.name)} in ${getTypeName(t.constraint)}`;
        }
        case (ts__default["default"].SyntaxKind.MappedType): {
            const t = type;
            const propName = getTypeName(t.typeParameter);
            const questionToken = t.questionToken ? '?' : '';
            const propType = getTypeName(t.type);
            return `{\n[${propName}]${questionToken}:${propType}\n}`;
        }
        case (ts__default["default"].SyntaxKind.PropertySignature): {
            const t = type;
            const propName = t.name.escapedText;
            const propType = getTypeName(t.type);
            return `${propName}${t.questionToken ? '?' : ''}: ${propType};`;
        }
        case (ts__default["default"].SyntaxKind.IndexSignature): {
            const parameters = type.parameters
                .map((p) => {
                const paramName = p.name.escapedText;
                const paramType = p.type ? getTypeName(p.type) : undefined;
                return `${paramName}${p.questionToken ? '?' : ''}${paramType ? `: ${paramType}` : ''}`;
            })
                .join(', ');
            const returnType = getTypeName(type.type);
            return `[${parameters}]: ${returnType}`;
        }
        case (ts__default["default"].SyntaxKind.ParenthesizedType): return `(${getTypeName(type.type)})`;
        case (ts__default["default"].SyntaxKind.FunctionType): {
            const parameters = type.parameters
                .map(getTypeName)
                .join(', ');
            const returnType = getTypeName(type.type);
            return `(${parameters}) => ${returnType}`;
        }
        case (ts__default["default"].SyntaxKind.TypeReference): {
            const name = getTypeName(type.typeName);
            const generics = (_a = type.typeArguments) === null || _a === void 0 ? void 0 : _a.map(getTypeName).join(', ');
            return name + (generics ? `<${generics}>` : '');
        }
        case (ts__default["default"].SyntaxKind.ArrayType): return `${getTypeName(type.elementType)}[]`;
        case (ts__default["default"].SyntaxKind.TupleType): return `[${type.elements.map(getTypeName).join(', ')}]`;
        default: {
            console.error('Couldn\'t extract type name. Consider updating the parser code. ', type);
            return 'any';
        }
    }
}
function getConfigProperties(configInterface) {
    const properties = configInterface.members.map((node) => {
        var _a;
        const name = node.name.escapedText;
        const type = getTypeName(node.type);
        const doc = (_a = node.jsDoc) === null || _a === void 0 ? void 0 : _a.map(doc => doc.comment);
        const kind = node.kind;
        const required = !node.questionToken;
        return { name, type, doc, kind, required };
    });
    return properties;
}
function gatherTypeReferences(types, collected = new Set()) {
    for (const type of types) {
        if (!type)
            continue;
        switch (type.kind) {
            case (ts__default["default"].SyntaxKind.Identifier): {
                collected.add(type.escapedText);
                break;
            }
            case (ts__default["default"].SyntaxKind.QualifiedName): {
                gatherTypeReferences([type.left], collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.TypeReference): {
                const t = type;
                gatherTypeReferences([type.typeName], collected);
                if (t.typeArguments)
                    gatherTypeReferences(t.typeArguments, collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.ParenthesizedType): {
                gatherTypeReferences([type.type], collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.FunctionType): {
                gatherTypeReferences(type.parameters.map(p => p.type).filter(t => t), collected);
                gatherTypeReferences([type.type], collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.TupleType):
                gatherTypeReferences(type.elements);
                break;
            case (ts__default["default"].SyntaxKind.UnionType):
                gatherTypeReferences(type.types, collected);
                break;
            case (ts__default["default"].SyntaxKind.IntersectionType):
                gatherTypeReferences(type.types, collected);
                break;
            case (ts__default["default"].SyntaxKind.ArrayType):
                gatherTypeReferences([type.elementType], collected);
                break;
            case (ts__default["default"].SyntaxKind.TypeLiteral): {
                gatherTypeReferences(type.members, collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.PropertySignature): {
                gatherTypeReferences([type.type], collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.IndexSignature): {
                const types = type.parameters
                    .map((p) => p.type)
                    .filter(t => t);
                gatherTypeReferences(types, collected);
                gatherTypeReferences([type.type], collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.TypeParameter): {
                gatherTypeReferences([type.constraint], collected);
                break;
            }
            case (ts__default["default"].SyntaxKind.MappedType): {
                gatherTypeReferences([type.typeParameter], collected);
                gatherTypeReferences([type.type], collected);
                break;
            }
        }
    }
    return Array.from(collected);
}
function getImportStatements(componentName, statements, configInterfaceMembers, generics = [], additionalComponentTypes = []) {
    const importSources = {};
    // We assume that all extend types in generics come from unovis/ts
    const genericExtends = generics.map(g => g.extends).filter(g => g);
    const genericDefaults = generics.map(g => g.default).filter(g => g);
    const componentTypes = [componentName, `${componentName}ConfigInterface`, ...additionalComponentTypes];
    for (const typeName of [...componentTypes, ...genericExtends, ...genericDefaults]) {
        importSources[typeName] = '@unovis/ts';
    }
    const importDeclarations = statements.filter(node => node.kind === ts__default["default"].SyntaxKind.ImportDeclaration);
    for (const importDec of importDeclarations) {
        for (const importEl of importDec.importClause.namedBindings.elements) {
            let importSource = importDec.moduleSpecifier.text;
            if (!importSource || importSource.startsWith('./') || importSource.startsWith('core/') ||
                importSource.startsWith('types/') || importSource.startsWith('utils/') || importSource.startsWith('components/') ||
                importSource.startsWith('styles/') || importSource.startsWith('data-models/') || importSource.startsWith('data/'))
                importSource = '@unovis/ts';
            importSources[importEl.name.escapedText] = importSource;
        }
    }
    const genericNames = generics.map(g => g.name);
    const typeList = gatherTypeReferences(configInterfaceMembers.map(node => node.type))
        .filter(name => !genericNames.includes(name)); // Filter out generics
    const importStatements = [];
    for (const name of Array.from(new Set([...componentTypes, ...genericExtends, ...genericDefaults, ...typeList]))) {
        const importSource = importSources[name];
        if (!importSource) {
            console.error(`Can't find import source for: ${name}`);
            continue;
        }
        const statement = importStatements.find(s => s.source === importSource);
        if (!statement)
            importStatements.push({ source: importSource, elements: [name] });
        else
            statement.elements.push(name);
    }
    return importStatements;
}
function getTSStatements(path) {
    const splitPath = path.split('/');
    const filename = splitPath[splitPath.length - 1];
    const code = fs.readFileSync(path, 'utf8');
    const parsed = ts__default["default"].createSourceFile(filename, code, ts__default["default"].ScriptTarget.Latest);
    return parsed.statements;
}
function kebabCase(str) {
    var _a;
    return (_a = str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)) === null || _a === void 0 ? void 0 : _a.filter(Boolean).map(x => x.toLowerCase()).join('-');
}
function getConfigSummary(component, skipProperties = ['width', 'height'], keepOnlyRequiredProperties = true, unovisBasePath = '../ts/src', configFileName = '/config.ts') {
    var _a;
    const requiredProps = new Map(); // maps interface to required props
    const configPropertiesMap = new Map(); // The map of all config properties
    let statements = []; // Statements and ...
    let configInterfaceMembers = []; // config interface members to resolve imports of custom types
    let generics = []; // Generics
    for (const [i, path] of component.sources.entries()) {
        const fullPath = `${unovisBasePath}${path}${configFileName}`;
        const sourceStatements = getTSStatements(fullPath);
        const configInterface = sourceStatements.find(node => ts__default["default"].isInterfaceDeclaration(node));
        if (!configInterface) {
            console.error('Config Interface was not found, ', path);
            continue;
        }
        const interfaceName = getTypeName(configInterface.name);
        requiredProps.set(interfaceName, []);
        const props = getConfigProperties(configInterface);
        props.forEach((p) => {
            if (skipProperties.includes(p.name))
                return;
            if (keepOnlyRequiredProperties && !p.required)
                return;
            configPropertiesMap.set(p.name, p);
            requiredProps.set(interfaceName, [...requiredProps.get(interfaceName), p.name]);
            const member = configInterface.members.find(m => { var _a; return ((_a = m.name) === null || _a === void 0 ? void 0 : _a.escapedText) === p.name; });
            if (member)
                configInterfaceMembers.push(member);
        });
        if (configInterface.heritageClauses) {
            const heritageClauses = Array.from(configInterface.heritageClauses);
            const utilityTypes = heritageClauses.flatMap(hc => hc.types.filter(t => t.typeArguments));
            utilityTypes.forEach(t => {
                const expression = t.expression.escapedText;
                const types = Array.from(t.typeArguments);
                const optionalProps = [];
                if (expression === 'Partial') {
                    // If partial, required members from the inherited interface are now optional
                    const partialInterfaceName = getTypeName(types[0].typeName);
                    optionalProps.push(...requiredProps.get(partialInterfaceName));
                }
                else if (expression === 'WithOptional') {
                    // If WithOptional, only delete the provided property from required props
                    const text = getTypeName(types[1]);
                    optionalProps.push(text);
                }
                optionalProps.forEach(p => {
                    configPropertiesMap.delete(p);
                    configInterfaceMembers = configInterfaceMembers.filter(m => { var _a; return ((_a = m.name) === null || _a === void 0 ? void 0 : _a.escapedText) !== p; });
                });
            });
        }
        statements = [...statements, ...sourceStatements];
        if (i === component.sources.length - 1) {
            generics = (_a = configInterface.typeParameters) === null || _a === void 0 ? void 0 : _a.map((t) => {
                var _a, _b, _c;
                const name = t.name.escapedText;
                const constraint = t.constraint;
                const constraintTypeName = (_a = constraint === null || constraint === void 0 ? void 0 : constraint.typeName) === null || _a === void 0 ? void 0 : _a.escapedText;
                const defaultValue = (_c = (_b = t.default) === null || _b === void 0 ? void 0 : _b.typeName) === null || _c === void 0 ? void 0 : _c.escapedText;
                return { name, extends: constraintTypeName, default: defaultValue };
            });
        }
    }
    const configProperties = Array.from(configPropertiesMap.values());
    return {
        configProperties,
        configInterfaceMembers,
        generics,
        statements,
    };
}

function getJSDocComments(jsdocStringArray) {
    return jsdocStringArray.map(jsdoc => {
        const strings = (jsdoc || '')
            // eslint-disable-next-line no-irregular-whitespace
            .replace(/ /g, '\\')
            .split('\n');
        for (let i = 1; i < strings.length; i += 1) {
            strings[i] = `   * ${strings[i]}`;
        }
        return `/** ${strings.join('\n')} */`;
    }).join('\n');
}
function checkGeneric(type, generics) {
    // Override the default generic with specified type from generics array
    const isFound = type.search(/[<|\s](Datum)>/);
    const isValid = generics === null || generics === void 0 ? void 0 : generics.find(t => t.name === 'Datum');
    if (isFound !== -1 && !isValid) {
        return `${type.slice(0, isFound + 1)}${generics[0].name}${type.slice(isFound + 6)}`;
    }
    return type;
}
function getComponentCode(componentName, generics, configProps, provide, importStatements, dataType = 'any', kebabCaseName, isStandAlone = false, styles = []) {
    const genericsStr = generics ? `<${generics === null || generics === void 0 ? void 0 : generics.map(g => g.name).join(', ')}>` : '';
    const genericsDefStr = generics
        ? `<${generics === null || generics === void 0 ? void 0 : generics.map(g => g.name + (g.extends ? ` extends ${g.extends}` : '') + (g.default ? ` = ${g.default}` : '')).join(', ')}>`
        : '';
    const decoratorProps = isStandAlone ? `template: '<div #container class="${kebabCaseName !== null && kebabCaseName !== void 0 ? kebabCaseName : kebabCase(componentName)}-container"></div>',
    styles: ['.${kebabCaseName !== null && kebabCaseName !== void 0 ? kebabCaseName : kebabCase(componentName)}-container { ${styles === null || styles === void 0 ? void 0 : styles.join('; ')} }']`
        : 'template: \'\'';
    const constructorArgs = isStandAlone
        ? `this.containerRef.nativeElement, ${componentName === 'BulletLegend' ? '{ ...this.getConfig(), renderIntoProvidedDomNode: true }' : 'this.getConfig()'}${dataType ? ', this.data' : ''}`
        : 'this.getConfig()';
    // Override the default generic with specified type from generics array
    return `// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges${isStandAlone ? ', ViewChild, ElementRef' : ''} } from '@angular/core'
${importStatements.map(s => `import { ${s.elements.join(', ')} } from '${s.source}'`).join('\n')}
import { ${provide} } from '../../core'

@Component({
  selector: 'vis-${kebabCaseName !== null && kebabCaseName !== void 0 ? kebabCaseName : kebabCase(componentName)}',
  ${decoratorProps},
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: ${provide}, useExisting: Vis${componentName}Component }],
})
export class Vis${componentName}Component${genericsDefStr} implements ${componentName}ConfigInterface${genericsStr}, AfterViewInit {
  ${isStandAlone ? '@ViewChild(\'container\', { static: false }) containerRef: ElementRef' : ''}
${configProps
        .map((p) => {
        var _a;
        return `
      ${getJSDocComments((_a = p.doc) !== null && _a !== void 0 ? _a : [])}
      @Input() ${p.name}${p.required ? '' : '?'}: ${checkGeneric(p.type, generics)}`;
    })
        .join('\n')}
  ${dataType ? `@Input() data: ${dataType}\n` : ''}
  component: ${componentName}${genericsStr} | undefined
  ${isStandAlone ? '' : 'public componentContainer: ContainerCore | undefined\n'}
  ngAfterViewInit (): void {
    this.component = new ${componentName}${genericsStr}(${constructorArgs})
    ${dataType ? `
      if (this.data) {
        this.component.setData(this.data)
        ${isStandAlone ? '' : 'this.componentContainer?.render()'}
      }` : ''}
  }

  ngOnChanges (changes: SimpleChanges): void {
    ${dataType ? 'if (changes.data) { this.component?.setData(this.data) }' : ''}
    this.component?.${componentName === 'BulletLegend' ? 'update' : 'setConfig'}(this.getConfig())
    ${isStandAlone ? '' : 'this.componentContainer?.render()'}
  }

  private getConfig (): ${componentName}ConfigInterface${genericsStr} {
    const { ${configProps.map(key => key.name).join(', ')} } = this
    const config = { ${configProps.map(key => key.name).join(', ')} }
    const keys = Object.keys(config) as (keyof ${componentName}ConfigInterface${genericsStr})[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
`;
}

function getModuleCode(componentName, kebabCaseName) {
    return `// !!! This code was automatically generated. You should not change it !!!
import { NgModule } from '@angular/core'
import { Vis${componentName}Component } from './${kebabCaseName !== null && kebabCaseName !== void 0 ? kebabCaseName : kebabCase(componentName)}.component'

@NgModule({
  imports: [],
  declarations: [Vis${componentName}Component],
  exports: [Vis${componentName}Component],
})
export class Vis${componentName}Module {}
`;
}

var _a;
const components = getComponentList();
const skipProperties = ['renderIntoProvidedDomNode'];
for (const component of components) {
    const { configProperties, configInterfaceMembers, generics, statements } = getConfigSummary(component, skipProperties, false);
    const importStatements = getImportStatements(component.name, statements, configInterfaceMembers, generics, component.isStandAlone ? [] : ['ContainerCore']);
    const componentCode = getComponentCode(component.name, generics, configProperties, component.angularProvide, importStatements, component.dataType, component.kebabCaseName, component.isStandAlone, component.angularStyles);
    const moduleCode = getModuleCode(component.name, component.kebabCaseName);
    const nameKebabCase = (_a = component.kebabCaseName) !== null && _a !== void 0 ? _a : kebabCase(component.name);
    const pathComponentBase = `src/${component.isStandAlone ? 'html-' : ''}components/${nameKebabCase}`;
    const pathComponent = `${pathComponentBase}/${nameKebabCase}.component.ts`;
    const pathModule = `${pathComponentBase}/${nameKebabCase}.module.ts`;
    child_process.exec(`mkdir ${pathComponentBase}`, () => {
        fs.writeFileSync(pathComponent, componentCode);
        fs.writeFileSync(pathModule, moduleCode);
        child_process.exec(`npx eslint ${pathComponent} ${pathModule} --fix`);
    });
    // eslint-disable-next-line no-console
    console.log(`${component.name} generated`);
    // eslint-disable-next-line no-console
    console.log(`  ${pathComponent}`);
    // eslint-disable-next-line no-console
    console.log(`  ${pathModule}`);
}
