import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";

const SColumn = styled.div`
  position: relative;
  width: 100%;
  height: ${({ spanHeight }) => (spanHeight ? "100%" : "auto")};
  max-width: ${({ maxWidth }) => `${maxWidth}px`};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ center }) => (center ? "center" : "flex-start")};
`;

const Column = (props) => {
  const { children, spanHeight, maxWidth, center } = props;
  return (
    <SColumn
      {...props}
      spanHeight={spanHeight}
      maxWidth={maxWidth}
      center={center}
    >
      {children}
    </SColumn>
  );
};

Column.propTypes = {
  children: PropTypes.node.isRequired,
  spanHeight: PropTypes.bool,
  maxWidth: PropTypes.number,
  center: PropTypes.bool,
};

Column.defaultProps = {
  spanHeight: false,
  maxWidth: 1000,
  center: false,
};

export default Column;
