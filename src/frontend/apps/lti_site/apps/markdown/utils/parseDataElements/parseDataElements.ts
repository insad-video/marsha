import { MarkdownDocumentModelName as modelName } from 'lib-components';
import { MarkdownAppData } from 'lib-markdown';

export const parseDataElements = (element: Element): MarkdownAppData => {
  const context = JSON.parse(element.getAttribute('data-context')!);

  context.resource_id = context.resource?.id;
  if (context.modelName === modelName.MARKDOWN_DOCUMENTS) {
    context.markdownDocument = context.resource;
    delete context.resource;
  }
  return context;
};
