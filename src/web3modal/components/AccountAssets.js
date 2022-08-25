import * as React from "react";
import Column from "./Column";
import AssetRow from "./AssetRow";

const AccountAssets = (props) => {
  const { assets, chainId } = props;
  const defaultNativeCurrency =
    (chainId === 1001) || (chainId === 8217)
      ? {
          contractAddress: "",
          symbol: "KLAY",
          name: "Klaytn",
          decimals: "18",
          balance: "0",
        }
      : {
          contractAddress: "",
          name: "Ethereum",
          symbol: "ETH",
          decimals: "18",
          balance: "0",
        };

  let nativeCurrency = defaultNativeCurrency;
  let tokens = [];
  if (assets && assets.length) {
    const filteredNativeCurrency = assets.filter((asset) =>
      asset && asset.symbol
        ? asset.symbol.toLowerCase() === nativeCurrency.symbol.toLowerCase()
        : false
    );
    nativeCurrency =
      filteredNativeCurrency && filteredNativeCurrency.length
        ? filteredNativeCurrency[0]
        : defaultNativeCurrency;
    tokens = assets.filter((asset) =>
      asset && asset.symbol
        ? asset.symbol.toLowerCase() !== nativeCurrency.symbol.toLowerCase()
        : false
    );
  }
  return (
    <Column center>
      <AssetRow key={nativeCurrency.name} asset={nativeCurrency} />
      {tokens.map((token) => (
        <AssetRow key={token.symbol} asset={token} />
      ))}
    </Column>
  );
};

export default AccountAssets;
