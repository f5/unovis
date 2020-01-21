/* eslint-disable */
// Copyright (c) Volterra, Inc. All rights reserved.
module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    schema: [] // no options
  },
  create: function(context) {
    return {
      MethodDefinition(node) {
        // to fix https://github.com/microsoft/TypeScript/issues/33939
        if (node.kind === 'set') {
          // console.log(node)
          context.report({
            node,
            message: 'Has Setter',
            fix(fixer) {
              return fixer.remove(node)
            }
          })
        } else if (node.kind === 'get') {
          const start = node.range[0];
          const end = node.value.returnType.range[0]
          context.report({
            node,
            message: 'Has Getter',
            fix(fixer) {
              return fixer.replaceTextRange([start, end], node.key.name)
            }
          })
        }
      }
    };
  }
};
