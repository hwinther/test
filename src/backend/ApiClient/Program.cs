using Refit;
using WebApi.Client;

var testApiClient = RestService.For<IExampleAPI>("https://localhost:44380");
await testApiClient.Ping();