package com.pharmaxcess_server.pharmaxcess_server.dto;

public class MachineDTO {
    private Integer id;
    private String name;
    private String status;
    private double latitude;
    private double longitude;

    public MachineDTO(Integer id, String name, String status, double latitude, double longitude) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getStatus() { return status; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
