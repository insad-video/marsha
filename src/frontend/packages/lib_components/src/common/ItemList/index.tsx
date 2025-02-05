import { Box, Text } from 'grommet';
import React from 'react';

interface ItemListProps<T> {
  children: (item: T, index: string) => React.ReactNode;
  itemList: T[];
  noItemsMessage: string;
}

export const ItemList = <T,>({
  children,
  itemList,
  noItemsMessage,
}: ItemListProps<T>) => {
  return (
    <Box direction="column" gap="small">
      <Box
        background="bg-select"
        border={{
          color: 'blue-off',
          size: 'small',
        }}
        round="xsmall"
      >
        <Box
          align="center"
          border={{
            color: 'blue-off',
            size: 'small',
            style: 'dashed',
            side: 'between',
          }}
          direction="column"
          gap="small"
          justify="center"
        >
          {itemList.length ? (
            itemList.map((item, index) => children(item, `list_item_${index}`))
          ) : (
            <Text color="blue-active" margin="small" size="0.8rem" truncate>
              {noItemsMessage}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
