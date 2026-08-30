import React, { type ReactNode } from 'react';
import { TitleFormatterProvider } from '@docusaurus/theme-common/internal';

// doc pages pass a full "Title | Group" title from src/theme/DocItem/Metadata,
// don't append "| Source2 Wiki" again on top of those
const formatter = (params: any) =>
{
  if (params.title.includes(` ${params.titleDelimiter} `))
  {
    return params.title.trim();
  }

  return params.defaultFormatter(params);
};

export default function ThemeProviderTitleFormatter({ children }: { children: ReactNode }): ReactNode
{
  return (
    <TitleFormatterProvider formatter={formatter}>
      {children}
    </TitleFormatterProvider>
  );
}
