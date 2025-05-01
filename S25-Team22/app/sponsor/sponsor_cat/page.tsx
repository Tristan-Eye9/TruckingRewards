"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { fetchUserAttributes } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";

export default function ITunesSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<any[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [sponsorCat, setSponsorCat] = useState<{
    song_id: string;
    title: string;
    artist: string;
    album: string;
    artwork_url: string;
    preview_url: string;
    store_url: string;
    release_date: string;
    genre: string;
    price: number;
  }[]>([]);
  const [catId, setCatId] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [sponsorCompany, setSponsorCompany] = useState<string | null>(null);

  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        if (attributes["custom:sponsorCompany"]) {
          setSponsorCompany(attributes["custom:sponsorCompany"]);
        }
      } catch (error) {
        console.error("Error fetching user attributes:", error);
      }
    };

    getUserAttributes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);



  const getCatalog = async () => {
    setLoading(true);
    try {
      const safeSponsor = sponsorCompany ?? "Unknown";
      const response = await fetch(
        `https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/catalogue/?company_name=${encodeURIComponent(safeSponsor)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch catalog");
      }

      const data = await response.json();
      const catalogueId = data.catalogue?.catalogue_id;
      setCatId(catalogueId);
      const songs = data.catalogue?.songs || [];

      if (songs.length === 0) {
        setSponsorCat([]);
        return;
      }

      // Get all song_ids, batch them in chunks of 10 to query iTunes
      const songIds = songs.map((song: any) => song.song_id).filter(Boolean);
      const idChunks = [];
      for (let i = 0; i < songIds.length; i += 10) {
        idChunks.push(songIds.slice(i, i + 10));
      }

      // Declare iTunesSongs 
      let iTunesSongs: any[] = [];

      for (const chunk of idChunks) {
        const iTunesResponse = await fetch(`https://itunes.apple.com/lookup?id=${chunk.join(",")}`);
        const iTunesData = await iTunesResponse.json();
        iTunesSongs = [...iTunesSongs, ...iTunesData.results];
      }

      // Merge sponsor price data into iTunes songs
      const mergedSongs = iTunesSongs.map((itunesSong) => {
        const custom = songs.find((s: any) => String(s.song_id) === String(itunesSong.trackId));
        return {
          song_id: custom?.song_id ?? itunesSong.trackId,
          title: itunesSong.trackName,
          artist: itunesSong.artistName,
          album: itunesSong.collectionName,
          artwork_url: itunesSong.artworkUrl100,
          preview_url: itunesSong.previewUrl,
          store_url: itunesSong.trackViewUrl,
          release_date: itunesSong.releaseDate,
          genre: itunesSong.primaryGenreName,
          price: custom?.price ?? Math.floor(Math.random() * 100) + 1,
          trackId: itunesSong.trackId,
        };
      });

      setSponsorCat(mergedSongs);
      console.log("Final catalog:", mergedSongs);
    } catch (err: any) {
      console.error("Error fetching song IDs or iTunes data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  async function handleSearch() {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      const newResults = data.results.map((item: any) => {
        const storedPoints = getStoredPoints(item.trackId);
        return {
          ...item,
          points: storedPoints !== null ? storedPoints : Math.floor(Math.random() * 100) + 1,
        };
      });

      localStorage.setItem("songPoints", JSON.stringify(newResults));
      setResults(newResults);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStoredPoints = (trackId: number) => {
    const storedPoints = localStorage.getItem("songPoints");
    if (storedPoints) {
      const parsedPoints = JSON.parse(storedPoints);
      const song = parsedPoints.find((item: any) => item.trackId === trackId);
      return song ? song.points : null;
    }
    return null;
  };

  const handleEditPoints = (trackId: number, newPoints: number) => {
    const updatedResults = results.map((item) =>
      item.trackId === trackId ? { ...item, points: newPoints } : item
    );
    setResults(updatedResults);
    localStorage.setItem("songPoints", JSON.stringify(updatedResults));
  };

  const saveSelectedSongsToBackend = async (songs: any[]) => {
    const attributes = await fetchUserAttributes();
    const sponsorCompanyName = attributes["custom:sponsorCompany"] || null;
    for (const song of songs) {
      const payload = {
        song_id: song.trackId,
        title: song.trackName,
        artist: song.artistName,
        album: song.collectionName,
        artwork_url: song.artworkUrl100,
        preview_url: song.previewUrl,
        store_url: song.trackViewUrl,
        release_date: song.releaseDate,
        genre: song.primaryGenreName,
        company_name: sponsorCompanyName || "Unknown Company",
        price: song.points || 0,
      };

      try {
        const response = await fetch(
          "https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/catalogue/update",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          if (response.status === 409) {
            console.warn(`Song already exists, skipping: ${song.trackName}`);
            continue;
          }
          throw new Error(`Failed to save song: ${song.trackName}`);
        }
        const data = await response.json();
        const catalogueId = data.catalogue?.catalogue_id;
        setCatId(catalogueId);

        console.log(`Saved: ${song.trackName}`);
      } catch (err) {
        console.error("Error saving song:", err);
      }
    }
  };

  const removeSelectedSongsFromBackend = async (songs: any[]) => {
    const attributes = await fetchUserAttributes();
    const sponsorCompanyName = attributes["custom:sponsorCompany"] || null;
    for (const song of songs) {
      const payload = {
        catalogue_id: catId,
        song_id: song.trackId,
      };

      try {
        const response = await fetch(
          "https://n0dkxjq6pf.execute-api.us-east-1.amazonaws.com/dev1/catalogue/update",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          if (response.status === 409) {
            console.warn(`Song already exists, skipping: ${song.trackName}`);
            continue;
          }
          throw new Error(`Failed to delete song: ${song.trackName}`);
        }



        console.log(`Deleted: ${song.trackName}`);
      } catch (err) {
        console.error("Error deleting song:", err);
      }
    }
  };

  useEffect(() => {
    if (showCatalog) {
      getCatalog();
    }
  }, [showCatalog]);

  const toggleSelectSong = (song: any) => {
    const isSelected = selectedSongs.some((selectedSong) => selectedSong.trackId === song.trackId);
    const updatedSelectedSongs = isSelected
      ? selectedSongs.filter((selectedSong) => selectedSong.trackId !== song.trackId)
      : [...selectedSongs, song];

    setSelectedSongs(updatedSelectedSongs);
    localStorage.setItem("selectedSongs", JSON.stringify(updatedSelectedSongs));

    if (isSelected) {
      removeSelectedSongsFromBackend([song]);
    } else {
      saveSelectedSongsToBackend([song]);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => {
        const handleSignOut = () => {
          signOut?.();
          router.replace("/");
        };

        const handleProfileClick = () => {
          router.push("/profile");
        };
        return (
          <div className="flex flex-col h-screen">
            <nav className="flex justify-between items-center bg-gray-800 p-4 text-white">
              <div className="flex gap-4">
                <Link href="/sponsor/home">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Home</button>
                </Link>
                <Link href="/aboutpage">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">About Page</button>
                </Link>
                <button className="bg-blue-600 px-4 py-2 rounded text-white">Catalog</button>
                <Link href="/sponsor/points">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Points</button>
                </Link>
                <Link href="/sponsor/sponsor_app">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Application</button>
                </Link>
                <Link href="/sponsor/addUsers">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Add Users</button>
                </Link>
                <Link href="/sponsor/sponsor_reports">
                  <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Reports</button>
                </Link>
              </div>

              <div className="relative" ref={dropdownRef}>
                <div className="cursor-pointer text-2xl" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <FaUserCircle />
                </div>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
                    <button
                      onClick={handleProfileClick}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </nav>

            <main className="max-w-3xl mx-auto p-6 flex-grow">
              <h1 className="text-3xl font-bold mb-6 text-center">Catalog</h1>

              {!showCatalog && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="flex gap-2 mb-6"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for songs about TRUCKS..."
                    className="border p-2 rounded w-full"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCatalog(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded ml-4"
                  >
                    View My Catalog
                  </button>
                </form>
              )}


              {showCatalog && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowCatalog(false)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Back to Search
                  </button>
                </div>
              )}

              {error && <p className="text-red-500 mt-2">{error}</p>}

              {showCatalog ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Your Selected Songs:</h2>
                  {sponsorCat.length === 0 ? (
                    <p className="text-gray-500">You haven't selected any songs yet.</p>
                  ) : (
                    <ul className="space-y-4">
                      {sponsorCat.map((song) => (
                        <li key={song.title} className="flex justify-between items-center border p-4 rounded-lg shadow-md bg-white">
                          <div className="flex items-center space-x-4">
                            <img
                              src={song.artwork_url}
                              alt={song.title}
                              className="w-20 h-20 rounded"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold">{song.title} - {song.artist}</span>
                              <span className="text-sm text-gray-500">Points: {song.price}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSelectSong(song)}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Deselect
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <ul className="space-y-4">
                  {results.map((item) => (
                    <li key={item.trackId || item.collectionId} className="border p-3 rounded shadow flex items-center">
                      <img
                        src={item.artworkUrl100}
                        alt={item.trackName || item.collectionName}
                        className="w-24 h-24 rounded mr-4"
                      />
                      <div className="flex-grow">
                        <p className="font-bold">
                          {item.trackName || item.collectionName} - {item.artistName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Points:{" "}
                          <input
                            type="number"
                            value={item.points}
                            onChange={(e) =>
                              handleEditPoints(item.trackId, Number(e.target.value))
                            }
                            className="w-16 p-1 border rounded"
                          />
                        </p>
                      </div>
                      {item.previewUrl && (
                        <audio controls className="ml-4">
                          <source src={item.previewUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      )}
                      <button
                        onClick={() => toggleSelectSong(item)}
                        className={`ml-4 px-4 py-2 rounded ${selectedSongs.some((song) => song.trackId === item.trackId) ? 'bg-green-500' : 'bg-gray-500'}`}
                      >
                        {selectedSongs.some((song) => song.trackId === item.trackId) ? 'Deselect' : 'Select'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </main>
          </div>
        );
      }}
    </Authenticator>
  );
}
