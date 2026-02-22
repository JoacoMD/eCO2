// contracts/eCO2.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../interfaces/IeCO2Tokens.sol";

enum Status { PENDING, APPROVED, REJECTED }

struct Project {
    uint256 id;
    string name;
    address projectAddress;
    uint256[] milestones;
    uint256 completedMilestones;
    Status status;
}

struct Company {
    uint256 id;
    string name;
    address companyAddress;
    Status status;
}

struct Listing {
    address seller;        // Proyecto que vende
    uint256 tokenId;
    uint256 amount;        // Cantidad disponible
    uint256 pricePerToken; // Precio en wei por token
    bool active;
}

contract eCO2 {
    string public greet = "eCO2 Smart Contract";
    mapping(address => Project) public projects;
    address[] public projectAddresses;
    mapping(address => Company) public companies;
    address[] public companyAddresses;
    address[] public administrators;
    address public owner;
    mapping(address => uint256[]) public ownedTokensIds;
    IeCO2Tokens public eco2TokenContract;
    mapping(uint256 => Listing) public listings; 

    uint256 public nextListingId = 1;
    uint256 public nextProjectId = 1;
    uint256 public nextCompanyId = 1;
    uint256 public nextMilestoneId = 1;

    event ProjectRegistered(address indexed projectAddress, uint256 projectId, string name);
    event ProjectApproved(address indexed projectAddress);
    event ProjectRejected(address indexed projectAddress);
    event MilestoneAdded(address indexed projectAddress, uint256 milestone);
    event MilestoneVerified(address indexed projectAddress, uint256 completedMilestones);
    event CompanyRegistered(address indexed companyAddress, uint256 companyId, string name);
    event CompanyApproved(address indexed companyAddress);
    event CompanyRejected(address indexed companyAddress);
    event AdministratorAdded(address indexed adminAddress);
    event AdministratorRemoved(address indexed adminAddress);
    event TokenMinted(address indexed to, uint256 tokenId, uint256 amount);
    event TokensListed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 amount, uint256 price);
    event TokensPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event ListingCancelled(uint256 indexed listingId);

    constructor(address eco2TokenAddress) {
        owner = msg.sender;
        administrators.push(msg.sender);
        eco2TokenContract = IeCO2Tokens(eco2TokenAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAdmin() {
        bool isAdministrator = false;
        for (uint256 i = 0; i < administrators.length; i++) {
            if (administrators[i] == msg.sender) {
                isAdministrator = true;
                break;
            }
        }
        require(isAdministrator, "Only administrators can perform this action");
        _;
    }

    modifier onlyApprovedProject() {
        require(projects[msg.sender].status == Status.APPROVED, "Project not approved");
        _;
    }

    function isAdmin(address adminAddress) public view returns (bool) {
        for (uint256 i = 0; i < administrators.length; i++) {
            if (administrators[i] == adminAddress) {
                return true;
            }
        }
        return false;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getBalanceOfAllTokens(address account) public view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory tokenIds = ownedTokensIds[account];
        address[] memory addresses = new address[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            addresses[i] = account;
        }
        uint256[] memory balances = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            balances = eco2TokenContract.balanceOfBatch(addresses, tokenIds);
        }
        return (tokenIds, balances);
    }

    // Registro de proyecto 
    function registerProject(string memory projectName) public returns (uint256) {
        require(projects[msg.sender].id == 0, "Project already registered");
        require(companies[msg.sender].id == 0, "Companies cannot register as projects");
        Project memory project = Project({
            id: nextProjectId++,
            name: projectName,
            projectAddress: msg.sender,
            milestones: new uint256[](0),
            completedMilestones: 0,
            status: Status.PENDING
        });
        projects[msg.sender] = project;
        projectAddresses.push(msg.sender);
        emit ProjectRegistered(msg.sender, project.id, projectName);
        return project.id; 
    }

    function getProject(address projectAddress) public view returns (Project memory) {
        return projects[projectAddress];
    }

    function getProjects() public view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projectAddresses.length);
        for (uint256 i = 0; i < projectAddresses.length; i++) {
            allProjects[i] = projects[projectAddresses[i]];
        }
        return allProjects;
   }

    // Aprobación proyecto
    function approveProject(address projectAddress) public onlyAdmin {
        require(projects[projectAddress].id != 0, "Project not registered");
        projects[projectAddress].status = Status.APPROVED;
        emit ProjectApproved(projectAddress);
        uint256 newToken = eco2TokenContract.mint(projectAddress, 100);
        emit TokenMinted(projectAddress, newToken, 100);
        ownedTokensIds[projectAddress].push(newToken);
    }

    function rejectProject(address projectAddress) public onlyAdmin {
        require(projects[projectAddress].id != 0, "Project not registered");
        projects[projectAddress].status = Status.REJECTED;
        emit ProjectRejected(projectAddress);
    }

    // Registro avance de proyecto
    function addMilestone() public returns (uint256) {
        require(projects[msg.sender].id != 0, "Project not registered");
        require(projects[msg.sender].status == Status.APPROVED, "Project not approved");
        uint256 milestone = nextMilestoneId++;
        projects[msg.sender].milestones.push(milestone);
        emit MilestoneAdded(msg.sender, milestone);
        return milestone;
    }

    // Verificación de avance
    function verifyMilestone(address projectAddress) public onlyAdmin {
        require(projects[projectAddress].id != 0, "Project not registered");
        require(
            projects[projectAddress].completedMilestones < projects[projectAddress].milestones.length,
            "All milestones already verified"
        );
        emit MilestoneVerified(projectAddress, projects[projectAddress].completedMilestones + 1);
        projects[projectAddress].completedMilestones += 1;

        uint256 newToken = eco2TokenContract.mint(projectAddress, 100);
        ownedTokensIds[projectAddress].push(newToken);
        emit TokenMinted(projectAddress, newToken, 100);
    }

    // Registro de empresa
    function registerCompany(string memory companyName) public returns (uint256) {
        require(companies[msg.sender].id == 0, "Company already registered");
        require(projects[msg.sender].id == 0, "Projects cannot register as companies");
        Company memory company = Company({
            id: nextCompanyId++,
            name: companyName,
            companyAddress: msg.sender,
            status: Status.PENDING
        });
        companies[msg.sender] = company;
        companyAddresses.push(msg.sender);
        emit CompanyRegistered(msg.sender, company.id, companyName);
        return company.id; 
    }

    function getCompany(address companyAddress) public view returns (Company memory) {
        return companies[companyAddress];
    }

    function getCompanies() public view returns (Company[] memory) {
        Company[] memory allCompanies = new Company[](companyAddresses.length);
        for (uint256 i = 0; i < companyAddresses.length; i++) {
            allCompanies[i] = companies[companyAddresses[i]];
        }
        return allCompanies;
    }

    // Aprobación de empresa
    function approveCompany(address companyAddress) public onlyAdmin {
        require(companies[companyAddress].id != 0, "Company not registered");
        companies[companyAddress].status = Status.APPROVED;
        emit CompanyApproved(companyAddress);
    }

    function rejectCompany(address companyAddress) public onlyAdmin {
        require(companies[companyAddress].id != 0, "Company not registered");
        companies[companyAddress].status = Status.REJECTED;
        emit CompanyRejected(companyAddress);
    }

    // Gestión de administradores
    function addAdministrator(address adminAddress) public onlyOwner {
        require(contains(adminAddress) == false, "Administrator already exists");
        administrators.push(adminAddress);
        emit AdministratorAdded(adminAddress);
    }

    function contains(address elementToFind) private view returns (bool) {
        for (uint i = 0; i < administrators.length; i++) {
            if (administrators[i] == elementToFind) {
                return true; 
            }
        }
        return false; 
    }

    function removeAdministrator(address adminAddress) public onlyOwner {
        for (uint256 i = 0; i < administrators.length; i++) {
            if (administrators[i] == adminAddress) {
                administrators[i] = administrators[administrators.length - 1];
                administrators.pop();
                emit AdministratorRemoved(adminAddress);
                break;
            }
        }
    }

    function getAdministrators() public view returns (address[] memory) {
        return administrators;
    }

    function burnProjectTokens(uint256 tokenId, uint256 amount) public {
        require(companies[msg.sender].id != 0, "Only registered companies can burn tokens");
        eco2TokenContract.burn(msg.sender, tokenId, amount);
    }

    function listTokensForSale(uint256 tokenId, uint256 amount, uint256 pricePerToken) 
        public 
        onlyApprovedProject 
        returns (uint256) 
    {
        require(amount > 0, "Amount must be > 0");
        require(pricePerToken > 0, "Price must be > 0");
        
        // Verificar que el proyecto tiene suficientes tokens
        // Nota: necesitarías importar IERC1155 para usar balanceOf
        // require(eco2TokenContract.balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            amount: amount,
            pricePerToken: pricePerToken,
            active: true
        });

        emit TokensListed(listingId, msg.sender, tokenId, amount, pricePerToken);
        return listingId;
    }

    // Empresa compra tokens
    function buyTokens(uint256 listingId, uint256 amount) 
        public 
        payable 
    {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(amount > 0 && amount <= listing.amount, "Invalid amount");

        uint256 totalPrice = amount * listing.pricePerToken;
        require(msg.value >= totalPrice, "Insufficient payment");

        eco2TokenContract.safeTransferFrom(listing.seller, msg.sender, listing.tokenId, amount);

        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        payable(listing.seller).transfer(totalPrice);

        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TokensPurchased(listingId, msg.sender, amount, totalPrice);

        uint256[] memory buyerTokenIds = ownedTokensIds[msg.sender];
        bool tokenExists = false;
        for (uint256 i = 0; i < buyerTokenIds.length; i++) {
            if (buyerTokenIds[i] == listing.tokenId) {
                tokenExists = true;
                break;
            }
        }
        if (!tokenExists) {
            ownedTokensIds[msg.sender].push(listing.tokenId);
        }
    }

    // Proyecto cancela listing
    function cancelListing(uint256 listingId) public {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.active, "Listing not active");
        
        listing.active = false;
        emit ListingCancelled(listingId);
    }

    function getListing(uint256 listingId) public view returns (Listing memory) {
        return listings[listingId];
    }

    function getListings() public view returns (Listing[] memory) {
        uint256 activeCount = 1;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        activeListings[0] = Listing({
            seller: address(0),
            tokenId: 0,
            amount: 0,
            pricePerToken: 0,
            active: false
        });
        uint256 index = 1;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        return activeListings;
    }
}