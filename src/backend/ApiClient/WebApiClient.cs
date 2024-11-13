// <auto-generated>
//     This code was generated by Refitter.
// </auto-generated>


using Refit;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

#nullable enable annotations

namespace WebApi.Client
{
    [System.CodeDom.Compiler.GeneratedCode("Refitter", "1.4.0.0")]
    public partial interface IExampleAPI
    {
        /// <summary>Gets a list of all blogs.</summary>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/Blogging/blog")]
        Task<ICollection<BlogDto>> GetBlogs();

        /// <summary>Creates a new blog or updates an existing one.</summary>
        /// <param name="body">The blog data transfer object</param>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Post("/Blogging/blog")]
        Task<BlogDto> PostBlog([Body] BlogDto body);

        /// <summary>Gets a specific blog by ID.</summary>
        /// <param name="id">The ID of the blog.</param>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/Blogging/blog/{id}")]
        Task<BlogDto> GetBlog(int id);

        /// <summary>Gets a list of posts related to a specific blog.</summary>
        /// <param name="blogId">The ID of the blog</param>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/Blogging/blog/{blogId}/posts")]
        Task<ICollection<PostDto>> GetPosts(int blogId);

        /// <summary>Gets a specific post by ID.</summary>
        /// <param name="id">The ID of the post</param>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/Blogging/post/{id}")]
        Task<PostDto> GetPost(int id);

        /// <summary>Creates a new post.</summary>
        /// <param name="body">The post data transfer object</param>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Post("/Blogging/post")]
        Task<PostDto> PostPost([Body] PostDto body);

        /// <summary>Sends a message using the MessageSender service.</summary>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/SendMessage")]
        Task<StringGenericValue> SendMessage();

        /// <summary>Returns ok</summary>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/Service/ping")]
        Task<StringGenericValue> Ping();

        /// <summary>Returns version</summary>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/Service/version")]
        Task<VersionInformation> Version();

        /// <summary>Returns weather forecast</summary>
        /// <returns>OK</returns>
        /// <exception cref="ApiException">
        /// Thrown when the request returns a non-success status code:
        /// <list type="table">
        /// <listheader>
        /// <term>Status</term>
        /// <description>Description</description>
        /// </listheader>
        /// <item>
        /// <term>500</term>
        /// <description>Internal Server Error</description>
        /// </item>
        /// </list>
        /// </exception>
        [Headers("Accept: application/json")]
        [Get("/WeatherForecast")]
        Task<ICollection<WeatherForecast>> GetWeatherForecast();


    }

}

//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

#pragma warning disable 108 // Disable "CS0108 '{derivedDto}.ToJson()' hides inherited member '{dtoBase}.ToJson()'. Use the new keyword if hiding was intended."
#pragma warning disable 114 // Disable "CS0114 '{derivedDto}.RaisePropertyChanged(String)' hides inherited member 'dtoBase.RaisePropertyChanged(String)'. To make the current member override that implementation, add the override keyword. Otherwise add the new keyword."
#pragma warning disable 472 // Disable "CS0472 The result of the expression is always 'false' since a value of type 'Int32' is never equal to 'null' of type 'Int32?'
#pragma warning disable 612 // Disable "CS0612 '...' is obsolete"
#pragma warning disable 649 // Disable "CS0649 Field is never assigned to, and will always have its default value null"
#pragma warning disable 1573 // Disable "CS1573 Parameter '...' has no matching param tag in the XML comment for ...
#pragma warning disable 1591 // Disable "CS1591 Missing XML comment for publicly visible type or member ..."
#pragma warning disable 8073 // Disable "CS8073 The result of the expression is always 'false' since a value of type 'T' is never equal to 'null' of type 'T?'"
#pragma warning disable 3016 // Disable "CS3016 Arrays as attribute arguments is not CLS-compliant"
#pragma warning disable 8603 // Disable "CS8603 Possible null reference return"
#pragma warning disable 8604 // Disable "CS8604 Possible null reference argument for parameter"
#pragma warning disable 8625 // Disable "CS8625 Cannot convert null literal to non-nullable reference type"
#pragma warning disable 8765 // Disable "CS8765 Nullability of type of parameter doesn't match overridden member (possibly because of nullability attributes)."

namespace WebApi.Client
{
    using System = global::System;

    

    /// <summary>
    /// Blog DTO
    /// </summary>
    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class BlogDto
    {
        /// <summary>
        /// Gets or sets the unique identifier for the blog.
        /// </summary>

        [JsonPropertyName("blogId")]
        public int BlogId { get; set; }

        /// <summary>
        /// Gets or sets the title of the blog.
        /// </summary>

        [JsonPropertyName("title")]
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the URL of the blog.
        /// </summary>

        [JsonPropertyName("url")]
        public string Url { get; set; }

    }

    /// <summary>
    /// Post DTO
    /// </summary>
    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class PostDto
    {
        /// <summary>
        /// Gets or sets the unique identifier for the post.
        /// </summary>

        [JsonPropertyName("postId")]
        public int PostId { get; set; }

        /// <summary>
        /// Gets or sets the title of the post.
        /// </summary>

        [JsonPropertyName("title")]
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the content of the post.
        /// </summary>

        [JsonPropertyName("content")]
        public string Content { get; set; }

        /// <summary>
        /// Gets or sets the unique identifier of the blog to which the post belongs.
        /// </summary>

        [JsonPropertyName("blogId")]
        public int BlogId { get; set; }

    }

    /// <summary>
    /// Represents a generic value container for value types.
    /// </summary>
    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class StringGenericValue
    {
        /// <summary>
        /// Gets or sets the value stored in the container.
        /// </summary>

        [JsonPropertyName("value")]
        public string Value { get; set; }

    }

    /// <summary>
    /// Represents version information for an assembly, including constants, environment name, version, and informational
    /// <br/>version.
    /// </summary>
    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class VersionInformation
    {
        /// <summary>
        /// Constants defined in the assembly, if any.
        /// </summary>

        [JsonPropertyName("constants")]
        public ICollection<string> Constants { get; set; }

        /// <summary>
        /// The version of the assembly.
        /// </summary>

        [JsonPropertyName("version")]
        public string Version { get; set; }

        /// <summary>
        /// The informational version of the assembly, which may include additional details.
        /// </summary>

        [JsonPropertyName("informationalVersion")]
        public string InformationalVersion { get; set; }

        /// <summary>
        /// The name of the environment where the application is running.
        /// </summary>

        [JsonPropertyName("environmentName")]
        public string EnvironmentName { get; set; }

    }

    /// <summary>
    /// Weather forecast model
    /// </summary>
    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class WeatherForecast
    {
        /// <summary>
        /// Date of forecast
        /// </summary>

        [JsonPropertyName("date")]
        [JsonConverter(typeof(DateFormatConverter))]
        public System.DateTimeOffset Date { get; set; }

        /// <summary>
        /// Temperature in celsius
        /// </summary>

        [JsonPropertyName("temperatureC")]
        public int TemperatureC { get; set; }

        /// <summary>
        /// Summary text
        /// </summary>

        [JsonPropertyName("summary")]
        public string Summary { get; set; }

    }

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0))")]
    internal class DateFormatConverter : JsonConverter<System.DateTimeOffset>
    {
        public override System.DateTimeOffset Read(ref System.Text.Json.Utf8JsonReader reader, System.Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
        {
            var dateTime = reader.GetString();
            if (dateTime == null)
            {
                throw new System.Text.Json.JsonException("Unexpected JsonTokenType.Null");
            }

            return System.DateTimeOffset.Parse(dateTime);
        }

        public override void Write(System.Text.Json.Utf8JsonWriter writer, System.DateTimeOffset value, System.Text.Json.JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
        }
    }


}

#pragma warning restore  108
#pragma warning restore  114
#pragma warning restore  472
#pragma warning restore  612
#pragma warning restore 1573
#pragma warning restore 1591
#pragma warning restore 8073
#pragma warning restore 3016
#pragma warning restore 8603
#pragma warning restore 8604
#pragma warning restore 8625