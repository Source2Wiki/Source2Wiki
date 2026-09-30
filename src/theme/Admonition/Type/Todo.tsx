import React from 'react';
import clsx from 'clsx';
import type { Props } from '@theme/Admonition/Type/Danger';
import AdmonitionLayout from '@theme/Admonition/Layout';
import TodoIcon from '@site/static/img/annotations/todo.svg';

const infimaClassName = 'alert alert--todo';

const defaultProps = {
    icon: <TodoIcon style={{ color: 'inherit', fill: 'currentColor' }}/>,
    title: "TODO",
};

export default function AdmonitionTypeTodo(props: Props) {
    return (
        <AdmonitionLayout
            {...defaultProps}
            {...props}
            className={clsx(infimaClassName, props.className)}>
            {props.children}
        </AdmonitionLayout>
    );
}