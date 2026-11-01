export const noComments = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      noComments: 'Comments are not allowed',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: 'noComments' });
        }
      },
    };
  },
};
