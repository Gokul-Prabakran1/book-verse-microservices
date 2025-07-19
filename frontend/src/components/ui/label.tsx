import React from 'react';

const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return <label {...props}>{props.children}</label>;
};

export default Label;
