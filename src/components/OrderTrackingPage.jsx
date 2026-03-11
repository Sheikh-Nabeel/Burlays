import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import {
  collectionGroup,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const normalizeStatus = (status) => {
  return String(status || "pending").trim().toLowerCase();
};

const getStatusStepIndex = (status) => {
  const s = normalizeStatus(status);
  if (s.includes("cancel") || s.includes("reject")) return -1;
  if (s.includes("deliver")) return 4;
  if (s.includes("out") || s.includes("dispatch") || s.includes("picked") || s.includes("way")) return 3;
  if (s.includes("prepar") || s.includes("cook") || s.includes("kitchen") || s.includes("ready")) return 2;
  if (s.includes("confirm") || s.includes("accept")) return 1;
  return 0;
};

const formatTimestamp = (ts) => {
  if (!ts) return "";
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const { orderId: orderIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialOrderId = orderIdParam || searchParams.get("orderId") || "";
  const [inputOrderId, setInputOrderId] = useState(initialOrderId);

  const [loading, setLoading] = useState(false);
  const [docPath, setDocPath] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [userOrders, setUserOrders] = useState([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);

  const steps = useMemo(
    () => ["Pending", "Confirmed", "Preparing", "On the way", "Delivered"],
    []
  );

  const resolveOrderDocRef = async (orderId) => {
    const topLevelRef = doc(db, "orders", orderId);
    const topLevelSnap = await getDoc(topLevelRef);
    if (topLevelSnap.exists()) return topLevelRef;

    const selectedBranch = JSON.parse(localStorage.getItem("selectedBranch") || "null");
    if (selectedBranch?.id && selectedBranch?.cityId) {
      const branchRef = doc(
        db,
        "cities",
        selectedBranch.cityId,
        "branches",
        selectedBranch.id,
        "orders",
        orderId
      );
      const branchSnap = await getDoc(branchRef);
      if (branchSnap.exists()) return branchRef;
    }

    if (selectedBranch?.id) {
      const legacyBranchRef = doc(db, "branches", selectedBranch.id, "orders", orderId);
      const legacyBranchSnap = await getDoc(legacyBranchRef);
      if (legacyBranchSnap.exists()) return legacyBranchRef;
    }

    const groupSnap = await getDocs(
      query(collectionGroup(db, "orders"), where(documentId(), "==", orderId), limit(1))
    );
    if (!groupSnap.empty) return groupSnap.docs[0].ref;

    return null;
  };

  useEffect(() => {
    let unsub = null;

    const load = async () => {
      const orderId = String(initialOrderId || "").trim();
      if (!orderId) {
        setOrder(null);
        setDocPath("");
        setError("");
        return;
      }

      setLoading(true);
      setError("");
      setOrder(null);
      setDocPath("");

      try {
        const ref = await resolveOrderDocRef(orderId);
        if (!ref) {
          setError("Order not found");
          return;
        }

        setDocPath(ref.path);

        unsub = onSnapshot(
          ref,
          (snap) => {
            if (!snap.exists()) {
              setOrder(null);
              setError("Order not found");
              return;
            }
            setOrder({ id: snap.id, ...snap.data() });
          },
          () => {
            setError("Failed to load order");
          }
        );
      } catch (e) {
        setError(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      if (unsub) unsub();
    };
  }, [initialOrderId]);

  const statusIndex = getStatusStepIndex(order?.status);
  const isCancelled = statusIndex === -1;

  const orderNumber = order?.orderNumber || order?.orderId || order?.id;
  const createdAtText = formatTimestamp(order?.createdAt) || order?.orderDate || "";
  const totalAmount = Number(order?.totalAmount || 0);
  const subtotal = Number(order?.subtotal || 0);
  const gstPercentage = Number(order?.gstPercentage || 0);
  const gstAmount = Number(order?.gstAmount || 0);

  const latitude = order?.latitude ?? order?.lat;
  const longitude = order?.longitude ?? order?.lng;
  const mapUrl =
    latitude && longitude ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : "";

  const handleSearch = () => {
    const next = String(inputOrderId || "").trim();
    if (!next) return;
    if (orderIdParam) {
      navigate(`/track-order/${encodeURIComponent(next)}`);
    } else {
      const params = new URLSearchParams(searchParams);
      params.set("orderId", next);
      setSearchParams(params, { replace: true });
    }
  };
  
  useEffect(() => {
    let unsub1 = null;
    let unsub2 = null;
    setUserOrdersLoading(true);
    const ready = () => setUserOrdersLoading(false);
    const uid = auth.currentUser?.uid || null;
    if (!uid) {
      const off = auth.onAuthStateChanged((u) => {
        if (u?.uid) {
          const q1 = query(collectionGroup(db, "orders"), where("userId", "==", u.uid));
          unsub1 = onSnapshot(q1, (snap) => {
            const a = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUserOrders((prev) => {
              const other = prev.filter((p) => p.__src !== "group");
              return [
                ...a.map((x) => ({ ...x, __src: "group" })),
                ...other,
              ];
            });
            ready();
          }, ready);
          const q2 = query(collection(db, "orders"), where("userId", "==", u.uid));
          unsub2 = onSnapshot(q2, (snap) => {
            const a = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUserOrders((prev) => {
              const other = prev.filter((p) => p.__src !== "top");
              return [
                ...a.map((x) => ({ ...x, __src: "top" })),
                ...other,
              ];
            });
            ready();
          }, ready);
        } else {
          setUserOrders([]);
          ready();
        }
      });
      return () => {
        off();
        if (unsub1) unsub1();
        if (unsub2) unsub2();
      };
    }
    const q1 = query(collectionGroup(db, "orders"), where("userId", "==", uid));
    unsub1 = onSnapshot(q1, (snap) => {
      const a = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUserOrders((prev) => {
        const other = prev.filter((p) => p.__src !== "group");
        return [
          ...a.map((x) => ({ ...x, __src: "group" })),
          ...other,
        ];
      });
      ready();
    }, ready);
    const q2 = query(collection(db, "orders"), where("userId", "==", uid));
    unsub2 = onSnapshot(q2, (snap) => {
      const a = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUserOrders((prev) => {
        const other = prev.filter((p) => p.__src !== "top");
        return [
          ...a.map((x) => ({ ...x, __src: "top" })),
          ...other,
        ];
      });
      ready();
    }, ready);
    return () => {
      if (unsub1) unsub1();
      if (unsub2) unsub2();
    };
  }, []);
  
  const dedupedSortedUserOrders = useMemo(() => {
    const map = new Map();
    userOrders.forEach((o) => {
      if (!map.has(o.id)) map.set(o.id, o);
    });
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.orderDate || 0);
      const db = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.orderDate || 0);
      return db - da;
    });
    return arr;
  }, [userOrders]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
          <div className="w-9"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              value={inputOrderId}
              onChange={(e) => setInputOrderId(e.target.value)}
              placeholder="Enter Order ID"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] bg-white"
            />
            <button
              onClick={handleSearch}
              className="bg-[#FFC72C] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#ffcf4b] transition-colors"
            >
              Track
            </button>
          </div>
          {docPath && (
            <div className="mt-3 text-[11px] text-gray-400 break-all">
              {docPath}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Your Orders</h2>
            {userOrdersLoading && <FaSpinner className="animate-spin text-[#FFC72C]" />}
          </div>
          {dedupedSortedUserOrders.length === 0 ? (
            <div className="text-sm text-gray-500 mt-3">No orders found.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {dedupedSortedUserOrders.map((o) => {
                const sid = String(o.status || "").toUpperCase();
                const dt = formatTimestamp(o.createdAt) || o.orderDate || "";
                const total = Number(o.totalAmount || 0);
                return (
                  <button
                    key={o.id}
                    onClick={() => navigate(`/track-order/${o.id}`)}
                    className="w-full text-left bg-white rounded-lg border border-gray-200 hover:border-[#FFC72C] transition-colors p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-gray-900">{o.orderNumber || o.id}</div>
                      <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold">
                        {sid}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{dt}</div>
                    <div className="text-sm font-bold text-[#E25C1D] mt-1">
                      Rs. {total.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {loading && (
          <div className="py-16 flex justify-center">
            <FaSpinner className="animate-spin text-4xl text-[#FFC72C]" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-lg font-bold text-gray-900">{error}</div>
            <div className="text-sm text-gray-500 mt-1">Please check your Order ID and try again.</div>
          </div>
        )}

        {!loading && order && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Order</div>
                  <div className="text-2xl font-bold text-gray-900">{orderNumber}</div>
                  <div className="text-xs text-gray-400 mt-1">{createdAtText}</div>
                  <div className="mt-3 inline-flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                      {String(order?.status || "pending")}
                    </span>
                    {order?.orderType && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {String(order.orderType)}
                      </span>
                    )}
                    {order?.paymentMethod && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {String(order.paymentMethod)}
                      </span>
                    )}
                  </div>
                </div>

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-black text-white font-bold px-4 py-3 rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    <FaMapMarkerAlt />
                    View Location
                  </a>
                )}
              </div>

              <div className="mt-6">
                {isCancelled ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="font-bold text-red-700">Order Cancelled</div>
                    <div className="text-sm text-red-600 mt-1">Please contact support if this is unexpected.</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {steps.map((label, idx) => {
                      const active = idx <= statusIndex;
                      return (
                        <div key={label} className="flex flex-col items-center text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${
                              active
                                ? "bg-[#FFC72C] text-black border-[#FFC72C]"
                                : "bg-white text-gray-400 border-gray-200"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className={`mt-2 text-[11px] font-semibold ${active ? "text-gray-900" : "text-gray-400"}`}>
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="font-bold text-gray-900 mb-4">Items</div>
              <div className="space-y-3">
                {(order.items || []).map((item, idx) => {
                  const qty = Number(item.quantity || 0);
                  const price = Number(item.price || 0);
                  const lineTotal = Number(item.totalPrice || price * qty);
                  return (
                    <div key={`${item.productId || item.name || "item"}-${idx}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "https://via.placeholder.com/80"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Qty {qty} • Rs. {price.toLocaleString()}
                        </div>
                        <div className="text-sm font-bold text-[#E25C1D] mt-1">
                          Rs. {lineTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="font-bold text-gray-900 mb-4">Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {gstPercentage > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({gstPercentage}%)</span>
                    <span>Rs. {gstAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="font-bold text-gray-900 mb-4">Delivery</div>
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-gray-900">{order.branchName || "Branch"}</div>
                {order.deliveryAddress && <div className="mt-1">{order.deliveryAddress}</div>}
                {order.customerPhone && <div className="mt-1">{order.customerPhone}</div>}
                {order.assignedRiderId && (
                  <div className="mt-3 text-xs text-gray-500 break-all">
                    Rider: {order.assignedRiderId}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
