/**
 * Use local versions of Ember.* (eslint-plugin-ember/local-modules)
 * https://github.com/netguru/eslint-plugin-ember/blob/master/docs/rules/local-modules.md
 *
 * Old code like:
 *  import Ember from 'ember';
 *  export default Ember.Component.extend({
 *    foo: Ember.computed(function() {}),
 *  });
 *
 * results in:
 *  import Ember from 'ember';
 *
 *  const {Component, computed} = Ember;
 *
 *  export default Component.extend({
 *    foo: computed(function() {}),
 *  });
 */

const assert = require('assert');

module.exports = function fixLocalModules(fileInfo, api) {
  const src = fileInfo.source;
  const j = api.jscodeshift;
  const root = j(src);

  const emberModules = root.find(j.MemberExpression)
    .filter(isEmberModule);
  const emberModuleNames = collectEmberModules(emberModules);
  const localModuleDeclaration = root.find(j.VariableDeclaration)
    .filter(isLocalModuleDeclaration)
    .paths()[0];

  if (emberModuleNames.length === 0) {
    return; // no occurrences, we're okay
  }

  // Replace instances of `Ember.get` with `get`, etc.
  emberModules.replaceWith(replaceEmberModule);

  // Add declaration `const {get, set} = Ember;`
  const newLocalModuleDeclaration = getEmberLocalModuleDeclaration(j, emberModuleNames);
  if (localModuleDeclaration) {
    localModuleDeclaration.replace(newLocalModuleDeclaration);
  } else {
    // Insert after last import if there wasn't a declaration already
    root.find(j.ImportDeclaration)
      .at(-1)
      .insertAfter(newLocalModuleDeclaration);
  }

  return root.toSource();
};

function isEmberModule(path) {
  const memberExpression = path.value;
  const memberObject = memberExpression.object;
  if (memberObject.type !== 'Identifier') return false;
  if (memberObject.name !== 'Ember') return false;
  return true;
}

function collectEmberModules(emberModules) {
  const paths = emberModules.paths();
  const moduleNames = paths.map(({value}) =>
    value.property.name
  );
  const uniqueModuleNames = Array.from(new Set(moduleNames));
  const sortedModuleNames = uniqueModuleNames.sort((a, b) => a - b);
  return sortedModuleNames;
}

function isLocalModuleDeclaration({value}) {
  const {declarations} = value;
  const declarator = declarations[0];
  if (!declarator) return false;
  if (declarator.id.type !== 'ObjectPattern') return false;
  if (declarator.init.type !== 'Identifier') return false;
  if (declarator.init.name !== 'Ember') return false;
  // Only handle single declarations
  assert(declarations.length === 1);
  return true;
}

function replaceEmberModule({value}) {
  return value.property;
}

function getEmberLocalModuleDeclaration(j, moduleNames) {
  const properties = moduleNames.map((name) => {
    const id = j.identifier(name);
    const property = j.property('init', id, id);
    property.shorthand = true;
    return property;
  });
  const declarations = [
    j.variableDeclarator(j.objectPattern(properties), j.identifier('Ember')),
  ];
  return j.variableDeclaration('const', declarations);
}
