import geckoterminal from "@/gecko-terminal/index";

async function fetchSupportedNetworks() {
    const response = await geckoterminal.pools.networks();
    console.log('supported networks', response);

    return response.data;
}

export default fetchSupportedNetworks;
