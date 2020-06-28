/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { memo, useRef, useState } from 'react';
import { useTheme } from 'emotion-theming';

import poll from "../background/poll";

const Options = () => {
  const countRef = useRef<any>();
  const [ loading, setLoading ] = useState<number>(0);

  const handleLoad = async () => {
    const count = +countRef.current.value;

    setLoading(count);
    for (const n of Array.from({ length: count }, (_, i) => i + 1)) {
      console.log(n);
      
      await poll(n);
    }
    setLoading(0);
  }

  return <div css={css`
    display: flex;
    justify-content: center;
  `}>
    <div>
      <input ref={countRef} type="number"
        max="100"
        min="1"
        defaultValue="10"
      />
      <button onClick={handleLoad} disabled={!!loading}>
          Batch load
      </button>
    </div>
  </div>;
};

export default memo(Options);
