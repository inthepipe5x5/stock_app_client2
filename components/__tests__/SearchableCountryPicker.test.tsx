import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchableCountryPicker, { CountryDropDown } from "@/components/forms/SearchableCountryPicker";

describe("SearchableCountryPicker Component", () => {
    test("renders without crashing", () => {
        const { getByText } = render(<SearchableCountryPicker />);
        expect(getByText("NO COUNTRY SELECTED")).toBeTruthy();
    });

    test("opens dropdown when button is pressed", () => {
        const { getByText, getByPlaceholderText } = render(
            <SearchableCountryPicker />
        );

        fireEvent.press(getByText("NO COUNTRY SELECTED"));

        expect(getByPlaceholderText("Search Country 🌎")).toBeTruthy();
    });

    test("search function filters country list", async () => {
        const { getByPlaceholderText, findByText } = render(
            <SearchableCountryPicker />
        );

        fireEvent.changeText(getByPlaceholderText("Search Country 🌎"), "Canada");

        const countryResult = await findByText("Canada");
        expect(countryResult).toBeTruthy();
    });

    test("closes dropdown when close button is pressed", async () => {
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <SearchableCountryPicker />
        );

        fireEvent.press(getByText("NO COUNTRY SELECTED"));
        expect(getByPlaceholderText("Search Country 🌎")).toBeTruthy();

        fireEvent.press(getByTestId("close-icon"));
        expect(() => getByPlaceholderText("Search Country 🌎")).toThrow();
    });
});

describe("CountryDropDown Component", () => {
    const mockSetSelected = jest.fn();
    const mockSetCountryDetails = jest.fn();

    const defaultProps = {
        selected: "",
        setSelected: mockSetSelected,
        setCountryDetails: mockSetCountryDetails,
    };

    test("renders without crashing", () => {
        const { getByText } = render(<CountryDropDown {...defaultProps} />);
        expect(getByText("NO COUNTRY SELECTED")).toBeTruthy();
    });

    test("opens dropdown when button is pressed", () => {
        const { getByText, getByPlaceholderText } = render(
            <CountryDropDown {...defaultProps} />
        );

        fireEvent.press(getByText("NO COUNTRY SELECTED"));

        expect(getByPlaceholderText("Search Country 🌎")).toBeTruthy();
    });

    test("search function filters country list", async () => {
        const { getByPlaceholderText, findByText } = render(
            <CountryDropDown {...defaultProps} />
        );

        fireEvent.changeText(getByPlaceholderText("Search Country 🌎"), "Canada");

        const countryResult = await findByText("Canada");
        expect(countryResult).toBeTruthy();
    });

    test("closes dropdown when close button is pressed", async () => {
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <CountryDropDown {...defaultProps} />
        );

        fireEvent.press(getByText("NO COUNTRY SELECTED"));
        expect(getByPlaceholderText("Search Country 🌎")).toBeTruthy();

        fireEvent.press(getByTestId("close-icon"));
        expect(() => getByPlaceholderText("Search Country 🌎")).toThrow();
    });

    test("selects a country from the list", async () => {
        const { getByText, getByPlaceholderText, findByText } = render(
            <CountryDropDown {...defaultProps} />
        );

        fireEvent.press(getByText("NO COUNTRY SELECTED"));
        fireEvent.changeText(getByPlaceholderText("Search Country 🌎"), "Canada");

        const countryResult = await findByText("Canada");
        fireEvent.press(countryResult);

        expect(mockSetSelected).toHaveBeenCalledWith("CAN");
        expect(mockSetCountryDetails).toHaveBeenCalledWith("CAN");
    });
});

describe("SearchableCountryPicker Component", () => {
    test("renders without crashing", () => {
        const { getByText } = render(<SearchableCountryPicker />);
        expect(getByText("NO COUNTRY SELECTED")).toBeTruthy();
    });

    test("opens dropdown when button is pressed", () => {
        const { getByText, getByPlaceholderText } = render(
            <SearchableCountryPicker />
        );

        fireEvent.press(getByText("NO COUNTRY SELECTED"));

        expect(getByPlaceholderText("Search Country 🌎")).toBeTruthy();
    });

    test("search function filters country list", async () => {
        const { getByPlaceholderText, findByText } = render(
            <SearchableCountryPicker />
        );

        fireEvent.changeText(getByPlaceholderText("Search Country 🌎"), "Canada");

        const countryResult = await findByText("Canada");
        expect(countryResult).toBeTruthy();
    });

    test("closes dropdown when close button is pressed", async () => {
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <SearchableCountryPicker />
        );

        fireEvent.press(getByText("NO COUNTRY SELECTED"));
        expect(getByPlaceholderText("Search Country 🌎")).toBeTruthy();

        fireEvent.press(getByTestId("close-icon"));
        expect(() => getByPlaceholderText("Search Country 🌎")).toThrow();
    });
});
