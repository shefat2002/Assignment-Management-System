namespace AssignmentSystem.Api.Models.Entities;

public class AppSetting
{
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
}