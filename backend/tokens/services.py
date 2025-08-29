from moralis import evm_api, auth
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("MORALIS_API_KEY")
sepolia_chain_hex = "0xaa36a7"  # Sepolia chain ID in hex
governance_token_address = os.getenv("GOVERNANCE_TOKEN_ADDRESS", "")


def get_token_balance(address):
    params = {
        "address": address,
        "chain": sepolia_chain_hex,
        "token_addresses": [governance_token_address] if governance_token_address else [],
    }

    result = evm_api.token.get_wallet_token_balances(
        api_key=api_key,
        params=params,
    )

    return result


def authenticate_challenge(chain, address):
    body = {
        "domain": "my.dapp",
        "chainId": chain,
        "address": address,
        "statement": "Please Confirm Login",
        "uri": "https://my.dapp/",
        "expirationTIme": "2023-02-28T00:00:00.000Z",
        "notBefore": "2021-02-28T00:00:00.000Z",
        "resources": ["https://docs.moralis.io"],
        "timeout": 30,
    }

    result = auth.challenge.request_challenge_evm(
        api_key=api_key,
        body=body,
    )

    return result


def verify_challenge(message, signature):
    body = {
        "message": message,
        "signature": signature,
    }

    result = auth.challenge.verify_challenge_evm(
        api_key=api_key,
        body=body,
    )

    return result
