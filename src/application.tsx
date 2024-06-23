import { useState } from "react";
import { GridStream } from "./grid-stream";

export const App = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isOpen2, setIsOpen2] = useState(false);
  const [queryKey, setQueryKey] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setQueryKey(!queryKey)}>
        CHANGE QUERY KEY
      </button>
      <button type="button" onClick={() => setIsOpen2(!isOpen2)}>
        TOGGLE 2nd
      </button>

      <button type="button" onClick={() => setIsOpen(!isOpen)}>
        TOGGLE
      </button>
      <p>20 events are sent. Then the Observable completes.</p>
      <p>
        If you change the key before completition, the query will be createed
        again.
      </p>
      {isOpen ? (
        <div style={{ display: "flex", gap: 10 }}>
          <GridStream queryKey={queryKey} />
          {isOpen2 && <GridStream queryKey="" />}
        </div>
      ) : null}
    </>
  );
};
