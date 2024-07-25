# PodPulse-Backend
`PodPulse` is a web-based application for user-friendly access and documentation of Kubernetes Container/Pod restart information. It allows for storage on your personal cloud-hosted SQL database.

The goal of `PodPulse` was to take away as many tedious command-line interface interactions as possible when needing to access and view users' Kubernetes restart logs. 

`PodPulse` syncs up with the pods and containers in your added namespaces automatically through an API call to the Kubernetes client-node (no need for pesky service account authorizations that leave users vulnerable to external threats). 

# Instructions
## Usage Guidelines
This app will only function with namespaces that exist
# Documentation
# Contribution Guidelines
# Future Features
| Feature                                                                               | Status    |
|---------------------------------------------------------------------------------------|-----------|
| Create Cloud-hosted Kubernetes Implementation                                         | 🙏🏻        |
| Create an organization login that can share container info across user accounts       | 🙏🏻        |
| Implement restart container button that pulls userName from cookie and logs it        | 🙏🏻        |
| ClearLogs should clear logs from the front end                                        | ⏳         |
| Pod Dashboard "container" # updates for multi-container pods                          | ⏳        |
| Connects to Local Clusters                                                            | ✅        |
| Pulls restart logs from client-node api                                               | ✅       |
| Watches for changes to restart logs from api                                          | ✅        |
| JWT and Cookies for secure session storage                                            | ✅        |


- ✅ = Ready to use
- ⏳ = In progress
- 🙏🏻 = Looking for contributors
## Preferred Workflow
Please fork to a new branch for specific features, and pull to the `dev` branch when the feature branch is running as intended.
