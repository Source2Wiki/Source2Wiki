import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type { Props } from '@theme/Admonition/Type/Tip';
import AdmonitionLayout from '@theme/Admonition/Layout';

const infimaClassName = 'alert alert--nonFGD';

const defaultProps = {
    icon: <img src={require('@site/static/img/nonFGD/obsolete.png').default} alt="Non FGD" style={{ width: '2rem', height: '2rem'}} />,
    title: "Non FGD",
};

export default function AdmonitionTypeNonFGD(props: Props) {
    return (
        <AdmonitionLayout
            {...defaultProps}
            {...props}
            className={clsx(infimaClassName, props.className)}>
            <Translate id="admonitions.nonFGD.description" description="Non FGD Admonition warning text.">
                This page is for an entity which exists in engine code, but not in the FGD, you will need to change the classname of the entity and add the keyvalues manually in Hammer!
            </Translate>
            {props.children}
        </AdmonitionLayout>
    );
}