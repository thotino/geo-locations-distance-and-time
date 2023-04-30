jest.mock("@googlemaps/google-maps-services-js");
const {
  getCountry,
  getTimezone,
  getDistanceWithGMaps,
  getDistanceWithGeoLib,
} = require("../../utils/geoUtils");

const ClientMock = require("@googlemaps/google-maps-services-js").Client;

const reverseGeocodeMock = jest.spyOn(ClientMock.prototype, "reverseGeocode");
const timezoneMock = jest.spyOn(ClientMock.prototype, "timezone");

describe("[unit] helpers `GeoUtils`", () => {
  describe("[unit] function `getCountry`", () => {
    test("should fail if no coordinate is provided", async () => {
      await expect(
        getCountry({ latitude: null, longitude: null })
      ).rejects.toThrow("ERR_NO_VALID_PARAMETER_PROVIDED");
      await expect(
        getCountry({ latitude: 0, longitude: null })
      ).rejects.toThrow("ERR_NO_VALID_PARAMETER_PROVIDED");
    });

    test("should fail if GMaps API fails", async () => {
      reverseGeocodeMock.mockRejectedValue(
        new Error("ERR_RANDOM_ERROR_FROM_MODULE")
      );

      await expect(
        getCountry({ latitude: 0.01, longitude: 0.01 })
      ).rejects.toThrowError("ERR_RANDOM_ERROR_FROM_MODULE");
      expect(reverseGeocodeMock).toHaveBeenCalledTimes(1);
    });
  });
});
