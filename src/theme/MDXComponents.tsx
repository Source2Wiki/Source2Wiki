import {Game} from '@site/src/components/Software';
import {Tool} from '@site/src/components/Software';
import {Social} from '@site/src/components/Software';
import DateRender from '@site/src/components/DateRenderer';
import OriginalMDXComponents from '@theme-original/MDXComponents';
import Img from '@site/src/components/Img';
import Convar from '@site/src/components/Convar';

export default {
  ...OriginalMDXComponents,
  Game,
  Tool,
  Social,
  img: Img,
  DateRender,
  Convar
};
