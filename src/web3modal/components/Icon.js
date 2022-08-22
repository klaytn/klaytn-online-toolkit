import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";

const SIcon = styled.img`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
`;

const Icon = (props) => {
  const { src, fallback, size } = props;
  return (
    <SIcon
      {...props}
      src={src}
      size={size}
      onError={(event) => (event.target.src = fallback)}
    />
  );
};

Icon.propTypes = {
  src: PropTypes.string,
  fallback: PropTypes.string,
  size: PropTypes.number,
};

Icon.defaultProps = {
  src: null,
  fallback: null,
  size: 20,
};

export default Icon;
