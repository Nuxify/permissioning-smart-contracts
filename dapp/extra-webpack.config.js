const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            $ENV: {
                ACCOUNT_INGRESS_ADDRESS: JSON.stringify(process.env.ACCOUNT_INGRESS_ADDRESS),
                NODE_INGRESS_ADDRESS: JSON.stringify(process.env.NODE_INGRESS_ADDRESS),
                NETWORK_ID: JSON.stringify(process.env.NETWORK_ID)
            }
        })
    ]
}
