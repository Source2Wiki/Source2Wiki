import React from 'react';
import clsx from 'clsx';
import type { Props } from '@theme/Admonition/Type/Tip';
import AdmonitionLayout from '@theme/Admonition/Layout';
import BugIcon from '@site/static/img/annotations/bug.svg';

const infimaClassName = 'alert alert--bug';

const defaultProps = {
    icon: <BugIcon style={{ color: 'inherit', fill: 'currentColor' }}/>,
    title: "BUG",
};

export default function AdmonitionTypeBug(props: Props) {
    return (
        <AdmonitionLayout
            {...defaultProps}
            {...props}
            className={clsx(infimaClassName, props.className)}>
            {props.children}
        </AdmonitionLayout>
    );
}