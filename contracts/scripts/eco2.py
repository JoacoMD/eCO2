from brownie import accounts, network, config, eCO2, eCO2Tokens
from brownie.network.gas.strategies import GasNowStrategy
from brownie.network import gas_price

CURRENT_CONTRACT = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE"
CURRENT_TOKEN_CONTRACT = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0"

def _set_local_gas():
    # Para redes locales: usar gas legacy fijo evita "max fee < base fee"
    if network.show_active() in ("development", "anvil"):
        gas_price("2 gwei")  # podés subirlo si querés

def _load_contract(address):
    _set_local_gas()
    return eCO2.at(address)

def _load_token_contract(address):
    _set_local_gas()
    return eCO2Tokens.at(address)

def deploy():
    _set_local_gas()
    account = accounts[0]
    eco2tokens = eCO2Tokens.deploy({"from": account, "gas_price": "2 gwei"})
    print(f"-----------------------\neCO2Tokens deployed at {eco2tokens.address}\n-----------------------")
    eco2 = eCO2.deploy(eco2tokens.address,{"from": account, "gas_price": "2 gwei"})
    print(f"-----------------------\neCO2 deployed at {eco2.address}\n-----------------------")
    eco2tokens.setEco2Contract(eco2.address, {"from": account, "gas_price": "2 gwei"})
    return eco2

def deploy_with_data():
    eco2 = deploy()
    account = accounts[1]  # Project owner
    tx = eco2.registerProject("Amazonas Verde", {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Project registered by {account.address}.")
    print(tx)
    eco2.approveProject(account.address, {"from": accounts[0], "gas_price": "2 gwei"})
    eco2.addMilestone(1000, {"from": account, "gas_price": "2 gwei"})
    eco2.verifyMilestone(account.address, {"from": accounts[0], "gas_price": "2 gwei"})
    eco2.listTokensForSale(1, 100, 5000, {"from": account, "gas_price": "2 gwei"})
    eco2.addMilestone(2000, {"from": account, "gas_price": "2 gwei"})
    account = accounts[2]  # Company
    tx = eco2.registerCompany("Empresa Sustentable S.A.", {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    eco2.approveCompany(account.address, {"from": accounts[0], "gas_price": "2 gwei"})


def deploy_eco2():
    _set_local_gas()
    account = accounts[0]
    eco2 = eCO2.deploy(CURRENT_TOKEN_CONTRACT,{"from": account, "gas_price": "2 gwei"})
    print(f"eCO2 deployed at {eco2.address}")
    print("Administrators:", eco2.getAdministrators())
    return eco2

def deploy_eco2tokens():
    _set_local_gas()
    account = accounts[0]
    eco2tokens = eCO2Tokens.deploy({"from": account, "gas_price": "2 gwei"})
    print(f"eCO2Tokens deployed at {eco2tokens.address}")
    eco2tokens.mint(account.address, 1000, {"from": account, "gas_price": "2 gwei"})
    balance = eco2tokens.balanceOf(account.address, 1)
    print(f"Minted 1000 eCO2 tokens to {account.address}. Balance: {balance}")
    return eco2tokens

def get_uri():
    _set_local_gas()
    eCO2_contract = _load_token_contract(CURRENT_TOKEN_CONTRACT) # Get the most recently deployed eCO2 contract
    uri = eCO2_contract.uri(1)
    print(f"URI for token ID 1: {uri}")
    return uri

def add_administrator():
    _set_local_gas()
    account = accounts[0]
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    admin_address = accounts[1].address 
    tx = eCO2_contract.addAdministrator(admin_address, {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Administrator {admin_address} added.")
    print("Updated Administrators:", eCO2_contract.getAdministrators())

def is_administrator():
    _set_local_gas()
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    admin_address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" 
    is_admin = eCO2_contract.isAdmin(admin_address)
    print(f"Is {admin_address} an administrator? {is_admin}")
    return is_admin

def register_project():
    _set_local_gas()
    account = accounts[4]  # Project owner
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.registerProject("Solar Energy Initiative", {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Project registered by {account.address}.")
    print(tx)
    # eCO2_contract.approveProject(account.address, {"from": accounts[0], "gas_price": "2 gwei"})
    # print("Project details:", eCO2_contract.getProject(account.address))
    # eCO2_contract.addMilestone(1000, {"from": account, "gas_price": "2 gwei"})
    # print("Milestone added. Project details:", eCO2_contract.getProject(account.address))
    # eCO2_contract.verifyMilestone(account.address, {"from": accounts[0], "gas_price": "2 gwei"})
    # print("Milestone verified. Project details:", eCO2_contract.getProject(account.address))
    
def register_company():
    _set_local_gas()
    account = accounts[2]  # Company
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.registerCompany("Empresa Sustentable S.A.", {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Company registered by {account.address}.")
    print("Company details:", eCO2_contract.getCompany(account.address))

def approve_project():
    _set_local_gas()
    account = accounts[0]  # Administrator
    project_account = accounts[3]  # Project owner
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.approveProject(project_account.address, {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Project approved by {account.address} for project {project_account.address}.")
    print("Project details:", eCO2_contract.getProject(project_account.address))

def approve_company():
    _set_local_gas()
    account = accounts[0]  # Administrator
    company_account = accounts[2]  # Company
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.approveCompany(company_account.address, {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Company approved by {account.address} for company {company_account.address}.")
    print("Company details:", eCO2_contract.getCompany(company_account.address))

def add_milestone():
    _set_local_gas()
    account = accounts[3]  # Project owner
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.addMilestone(2000, {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Milestone added by {account.address}.")
    print("Project details:", eCO2_contract.getProject(account.address))

def verify_milestone():
    _set_local_gas()
    account = accounts[0]  # Administrator
    project_account = accounts[3]  # Project owner
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.verifyMilestone(project_account.address, {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Milestone verified by {account.address} for project {project_account.address}.")
    print("Project details:", eCO2_contract.getProject(project_account.address))

def create_listing():
    _set_local_gas()
    account = accounts[1]  # Company
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.listTokensForSale(1, 100, 5000, {"from": account, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Listing created by {account.address}.")
    listings = eCO2_contract.getListings()
    print("Current Listings:", listings)

def purchase_tokens():
    _set_local_gas()
    account = accounts[2]  # Company
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    tx = eCO2_contract.buyTokens(1, 1, {"from": account, "value": 5000, "gas_price": "2 gwei"})
    tx.wait(1)
    print(f"Tokens purchased by {account.address}.")
    listings = eCO2_contract.getListings()
    print("Updated Listings:", listings)

def balance_of_tokens():
    _set_local_gas()
    account = accounts[2]  # Company
    eCO2_token_contract = _load_token_contract(CURRENT_TOKEN_CONTRACT) # Get the most recently deployed eCO2 token contract
    balance = eCO2_token_contract.balanceOf(account.address, 2)
    print(f"Balance of eCO2 tokens for {account.address}: {balance}")
    return balance

def get_listings():
    _set_local_gas()
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    listings = eCO2_contract.getListings()
    print("Current Listings:", listings)
    return listings

def get_projects():
    _set_local_gas()
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    projects = eCO2_contract.getProjects()
    print("Registered Projects:", projects)
    return projects

def get_project_details():
    _set_local_gas()
    eCO2_contract = _load_contract(CURRENT_CONTRACT) # Get the most recently deployed eCO2 contract
    project_account = accounts[3]  # Project owner
    project_details = eCO2_contract.getProject(project_account.address)
    print(f"Details for project {project_account.address}:", project_details)
    return project_details