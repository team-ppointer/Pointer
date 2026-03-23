/**
 * Custom ESLint plugin to enforce typography token usage.
 *
 * Rules:
 * 1. no-deprecated-font-token (warning)
 *    - Disallows old fontSize tokens (text-32b, text-24b, etc.) in className
 *
 * 2. no-direct-typography-token (error)
 *    - Disallows new typography tokens used as text-* directly (e.g. text-title-1-bold)
 *    - Must use typo-* classes instead (e.g. typo-title-1-bold)
 */

const DEPRECATED_TOKENS = [
  '32b',
  '24b',
  '20b',
  '20r',
  '18b',
  '18sb',
  '18m',
  '16b',
  '16sb',
  '16m',
  '16r',
  '14b',
  '14sb',
  '14m',
  '14r',
  '13b',
  '13m',
  '13r',
  '12sb',
  '12m',
  '12r',
  '10m',
  '10r',
];

const TYPOGRAPHY_TOKEN_PREFIXES = [
  'display-1-',
  'title-1-',
  'title-2-',
  'heading-1-',
  'heading-2-',
  'body-1-',
  'body-2-',
  'label-1-',
  'caption-',
];

const deprecatedPattern = new RegExp(`\\btext-(${DEPRECATED_TOKENS.join('|')})\\b`, 'g');

const directTypographyPattern = new RegExp(
  `\\btext-(${TYPOGRAPHY_TOKEN_PREFIXES.map((p) => p.replace('-', '\\-')).join('|')})\\S*\\b`,
  'g'
);

/**
 * Extract class strings from a node and report matches.
 */
function checkStringForClasses(context, node, value, rule) {
  if (typeof value !== 'string') return;

  const pattern = rule === 'deprecated' ? deprecatedPattern : directTypographyPattern;
  pattern.lastIndex = 0;

  let match;
  while ((match = pattern.exec(value)) !== null) {
    const matched = match[0];
    if (rule === 'deprecated') {
      context.report({
        node,
        message: `"${matched}" is deprecated. Use the corresponding typo-* class instead (e.g. "typo-title-1-bold").`,
      });
    } else {
      const replacement = matched.replace(/^text-/, 'typo-');
      context.report({
        node,
        message: `Use "${replacement}" instead of "${matched}" to ensure responsive typography.`,
      });
    }
  }
}

function checkNode(context, node, rule) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    checkStringForClasses(context, node, node.value, rule);
  } else if (node.type === 'TemplateLiteral') {
    node.quasis.forEach((quasi) => {
      checkStringForClasses(context, node, quasi.value.raw, rule);
    });
    node.expressions.forEach((expr) => checkNode(context, expr, rule));
  } else if (node.type === 'JSXExpressionContainer') {
    checkNode(context, node.expression, rule);
  } else if (node.type === 'CallExpression') {
    node.arguments.forEach((arg) => checkNode(context, arg, rule));
  } else if (node.type === 'ConditionalExpression') {
    checkNode(context, node.consequent, rule);
    checkNode(context, node.alternate, rule);
  } else if (node.type === 'LogicalExpression') {
    checkNode(context, node.right, rule);
  }
}

function createRule(rule) {
  return {
    meta: {
      type: rule === 'deprecated' ? 'suggestion' : 'problem',
      docs: {
        description:
          rule === 'deprecated'
            ? 'Disallow deprecated fontSize tokens in className'
            : 'Disallow direct text-* usage of new typography tokens, require typo-* instead',
      },
      schema: [],
    },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name !== 'className' && node.name.name !== 'class') {
            return;
          }
          if (node.value) {
            checkNode(context, node.value, rule);
          }
        },
      };
    },
  };
}

module.exports = {
  rules: {
    'no-deprecated-font-token': createRule('deprecated'),
    'no-direct-typography-token': createRule('direct'),
  },
};
